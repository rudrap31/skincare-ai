const express = require('express');
const axios = require('axios');
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', async (req, res) => {
  const { upc, user_id } = req.body;

  if (!upc || !user_id) {
    return res.status(400).json({ error: 'Missing UPC or user_id' });
  }

  // Fetch skin_type
  const { data: skinTypeData, error: skinTypeError } = await supabase
    .from("profiles")
    .select("skin_type")
    .eq("user_id", user_id)
    .single();

  // Fetch skin_concerns
  const { data: skinConcernsData, error: skinConcernsError } = await supabase
    .from("profiles")
    .select("skin_concerns")
    .eq("user_id", user_id)
    .single();

  if (skinTypeError || skinConcernsError || !skinTypeData || !skinConcernsData) {
    return res.status(400).json({ error: 'Missing skin profile data' });
  }

  const skin_type = skinTypeData.skin_type;
  const skin_concerns = skinConcernsData.skin_concerns;

  try {
    // Step 1: Fetch product info from UPCItemDB
    const upcRes = await axios.get(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`
    );
    const item = upcRes.data.items?.[0];
    if (!item) return res.status(404).json({ error: 'Product not found' });

    const product_name = item.title;
    const image_url = item.images?.[0] || null;
    const brand = item.brand || 'Unknown';

    // Step 2: Ask OpenAI for rating
    const prompt = `You are a skincare expert. A user with ${skin_type} skin and concerns like ${skin_concerns.join(', ')} scanned a product.

Product name: ${product_name}

Rate this product from 0 to 10, and provide up to 3 combined pros and cons depending on the product quality.

Return your response in JSON format like:
{
  "rating": 7.5,
  "pros": ["Hydrating", "No fragrance"],
  "cons": ["Contains alcohol"]
}`;

    const openaiRes = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const resultText = openaiRes.choices[0].message.content.trim();

    let parsed;
    try {
      parsed = JSON.parse(resultText);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse OpenAI response', raw: resultText });
    }

    // Step 3: Save to Supabase
    const { error: insertError } = await supabase.from('rated_products').insert({
      user_id,
      upc,
      product_name,
      brand,
      image_url,
      rating: parsed.rating,
      pros: parsed.pros,
      cons: parsed.cons
    });

    if (insertError) throw insertError;

    res.status(200).json({
      success: true,
      data: {
        product_name,
        brand,
        image_url,
        ...parsed,
      },
    });
  } catch (err) {
    console.error('Rate product error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
