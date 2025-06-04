import express from 'express';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

const router = express.Router();

router.post('/', async (req, res) => {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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

    try {
        // Fetch product info from UPCItemDB
        const upcRes = await axios.get(
            `https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`
        );
        const item = upcRes.data.items?.[0];
        if (!item) return res.status(404).json({ error: 'Product not found' });

        const product_name = item.title;
        const image_url = item.images?.[0] || null;
        const brand = item.brand || 'Unknown';

        // Check if it is a skincare product
        const checkPrompt = `Given the product name "${product_name}", is this a skincare product? Respond ONLY with JSON: { "is_skincare": true } or { "is_skincare": false }.`;

        const checkRes = await openai.chat.completions.create({
            model: 'gpt-4.1',
            messages: [{ role: 'user', content: checkPrompt }],
        });

        let isSkincare;
        try {
            isSkincare = JSON.parse(checkRes.choices[0].message.content.trim());
        } catch (e) {
            return res
                .status(500)
                .json({
                    error: 'Failed to parse OpenAI skincare check response',
                });
        }

        if (!isSkincare.is_skincare) {
            return res
                .status(400)
                .json({
                    error: 'This does not appear to be a skincare product',
                });
        }

        // Ask OpenAI for rating
        const prompt = `You are a skincare expert. A user with ${skin_type} skin and concerns like ${skin_concerns.join(
            ', '
        )} scanned a product.
    
    Product name: ${product_name}
    
    Rate this product from 0 to 10, and provide 3 combined pros and cons depending on the product quality.
    Rating 8-10 -> 3 pros
    Rating 6-8 -> 2 pros, 1 con
    Rating 4-6 -> 1 pro, 2 cons
    Rating 0-4 -> 3 cons
    
    Return your response in JSON format like:
    {
      "rating": 7.5,
      "summary": "The [product name] is a great mostrizer to use especially paired with sunscreen. It is also sutiable for all skin types"
      "pros": ["Hydrating", "No fragrance"],
      "cons": ["Contains alcohol"]
    }`;

        const openaiRes = await openai.chat.completions.create({
            model: 'gpt-4.1',
            messages: [{ role: 'user', content: prompt }],
        });

        const resultText = openaiRes.choices[0].message.content.trim();

        let parsed;
        try {
            parsed = JSON.parse(resultText);
        } catch (e) {
            return res.status(500).json({
                error: 'Failed to parse OpenAI response',
                raw: resultText,
            });
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

        if (insertError) throw insertError;

        res.status(200).json({
            success: true,
            data: insertedProduct,
        });
    } catch (err) {
        console.error('Rate product error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

export default router;
