import express from 'express';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

const router = express.Router();

async function getValidImage(images) {
    // Check if url is a valid image
    async function isValidImageUrl(url) {
        try {
            const res = await fetch(url, { method: 'HEAD', timeout: 5000 });
            const type = res.headers.get('Content-Type');
            return res.ok && type && type.startsWith('image/');
        } catch {
            return false;
        }
    }

    // https versions
    for (const originalUrl of images) {
        let url = originalUrl;
        if (url.startsWith('http://')) {
            url = url.replace('http://', 'https://');
        }
        if (await isValidImageUrl(url)) {
            return url;
        }
    }

    for (const url of images) {
        if (await isValidImageUrl(url)) {
            return url;
        }
    }

    return null;
}

router.post('/', async (req, res) => {
    try {
        // Initialize clients with error handling
        let supabase, openai;
        try {
            supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );
            openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        } catch (err) {
            //console.error('Client initialization error:', err);
            return res.status(500).json({ error: 'Service configuration error' });
        }

        const { upc, user_id } = req.body;

        if (!upc || !user_id) {
            return res.status(400).json({ error: 'Missing UPC or user_id' });
        }

        // Fetch skin_type
        const { data: skinTypeData, error: skinTypeError } = await supabase
            .from('profiles')
            .select('skin_type')
            .eq('user_id', user_id)
            .single();

        // Fetch skin_concerns
        const { data: skinConcernsData, error: skinConcernsError } = await supabase
            .from('profiles')
            .select('skin_concerns')
            .eq('user_id', user_id)
            .single();

        if (
            skinTypeError ||
            skinConcernsError ||
            !skinTypeData ||
            !skinConcernsData
        ) {
            return res.status(400).json({ error: 'Missing skin profile data' });
        }

        const skin_type = skinTypeData.skin_type;
        const skin_concerns = skinConcernsData.skin_concerns;

        // Fetch product info from BarcodeSpider with error handling
        let barcodeRes, item;
        try {
            barcodeRes = await axios.get(
                `https://api.barcodespider.com/v1/lookup?token=${process.env.BARCODESPIDER_API_KEY}&upc=${upc}`,
                { 
                    timeout: 10000,
                }
            );
            
            // Check if the response is successful
            if (barcodeRes.data.item_response?.code !== 200) {
                return res.status(404).json({ error: 'Product not found' });
            }
            
            item = barcodeRes.data.item_attributes;
            if (!item) return res.status(404).json({ error: 'Product not found' });
        } catch (err) {
            console.error('BarcodeSpider API error:', err);
            return res.status(500).json({ error: 'Failed to fetch product information' });
        }

        const product_name = item.title;
        let image_url;
        try {
            // BarcodeSpider returns a single image URL, but we'll still use the validation function
            // Create an array to maintain compatibility with existing getValidImage function
            const images = item.image ? [item.image] : [];
            
            // Also check store images as fallback
            if (barcodeRes.data.stores && barcodeRes.data.stores.length > 0) {
                barcodeRes.data.stores.forEach(store => {
                    if (store.image) {
                        images.push(store.image);
                    }
                });
            }
            
            image_url = (await getValidImage(images)) || null;
        } catch (err) {
            //console.error('Image validation error:', err);
            image_url = null; // Continue without image
        }
        const brand = item.brand || 'Unknown';

        // Check if it is a skincare product
        const checkPrompt = `Given the product name "${product_name}", is this a skincare product? Respond ONLY with JSON: { "is_skincare": true } or { "is_skincare": false }.`;

        let checkRes, isSkincare;
        try {
            checkRes = await openai.chat.completions.create({
                model: 'gpt-4.1',
                messages: [{ role: 'user', content: checkPrompt }],
            });

            isSkincare = JSON.parse(checkRes.choices[0].message.content.trim());
        } catch (err) {
            //console.error('OpenAI skincare check error:', err);
            return res.status(500).json({ error: 'Failed to analyze product type' });
        }

        if (!isSkincare.is_skincare) {
            return res.status(400).json({
                error: 'This does not appear to be a skincare product',
            });
        }

        // Ask OpenAI for rating
        const prompt = `You are a skincare expert. A user with ${skin_type} skin and concerns like ${skin_concerns.join(
            ', '
        )} scanned a product.
    
    Product name: ${product_name}
    
    Rate this product from 0 to 100, and provide 3 combined pros and cons depending on the product quality.
    Rating 80-100 -> 3 pros
    Rating 60-80 -> 2 pros, 1 con
    Rating 40-60 -> 1 pro, 2 cons
    Rating 00-40 -> 3 cons
    
    Return your response in JSON format like:
    {
      "rating": 75,
      "summary": "The [product name] is a great moisturizer to use especially paired with sunscreen. It is also suitable for all skin types",
      "pros": ["Hydrating", "No fragrance"],
      "cons": ["Contains alcohol"]
    }`;

        let openaiRes, parsed;
        try {
            openaiRes = await openai.chat.completions.create({
                model: 'gpt-4.1',
                messages: [{ role: 'user', content: prompt }],
            });

            const resultText = openaiRes.choices[0].message.content.trim();
            parsed = JSON.parse(resultText);
        } catch (err) {
            //console.error('OpenAI rating error:', err);
            return res.status(500).json({ error: 'Failed to analyze product' });
        }

        // Save to Supabase
        const { data: insertedProduct, error: insertError } = await supabase
            .from('scanned_products')
            .insert({
                user_id: user_id,
                product: product_name,
                brand: brand,
                rating: parsed.rating,
                summary: parsed.summary,
                image: image_url,
                pros: parsed.pros,
                cons: parsed.cons,
            })
            .select()
            .single();

        if (insertError) {
            //console.error('Database insert error:', insertError);
            return res.status(500).json({ error: 'Failed to save product data' });
        }

        res.status(200).json({
            success: true,
            data: insertedProduct,
        });

    } catch (err) {
        //console.error('Unexpected error in rate product route:', err);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

export default router;