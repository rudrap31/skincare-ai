import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

const router = express.Router();

router.post('/', async (req, res) => {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { img, user_id } = req.body;

    if (!img || !user_id) {
        return res.status(400).json({ error: 'Missing image or user_id' });
    }

    try {
        // Fetch skin_type and skin_concerns
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('skin_type, skin_concerns')
            .eq('user_id', user_id)
            .single();

        if (profileError || !profile) {
            return res.status(400).json({ error: 'Missing skin profile data' });
        }

        const { skin_type, skin_concerns } = profile;

        // Use the actual image path from the request instead of hardcoded path
        const { data: signedUrlData, error: signedUrlError } =
            await supabase.storage
                .from('face-images')
                .createSignedUrl(img, 60 * 60); // 1 hour expiry

        if (signedUrlError) {
            console.error('Signed URL error:', signedUrlError);
            return res
                .status(500)
                .json({ error: 'Failed to create signed URL' });
        }

        const signedUrl = signedUrlData.signedUrl;

        const checkPrompt = `Given an image, is this a picture of a face? If it is bad lighting respond false
                         Respond ONLY with JSON: { "is_face": true } or { "is_face": false }.`;

        const checkCompletion = await openai.chat.completions.create({
            model: 'gpt-4.1',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: checkPrompt },
                        {
                            type: 'image_url',
                            image_url: {
                                url: signedUrl,
                            },
                        },
                    ],
                },
            ],
        });
        console.log(checkCompletion.choices[0].message.content)

        let isFace;
        try {
            isFace = JSON.parse(
                checkCompletion.choices[0].message.content.trim()
            );
        } catch (e) {
            return res.status(500).json({
                error: 'Failed to parse OpenAI skincare check response',
            });
        }

        if (!isFace.is_face) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_FACE_IMAGE',
                    message: 'This does not appear to be an image of a face',
                },
            });
        }

        const prompt = `Analyze this face for skin quality. Avoid sugarcoating, give clear, accurate feedback and provide truthful, unbiased analysis. 
                        Skin type: ${skin_type}. Concerns: ${skin_concerns.join(
            ', '
        )}. 
                        Rate redness, acne, hydration and give an overall score from 1-100. Provide a detailed analysis and any tips if any.
                        Return your response in JSON format like:
                        {
                            "redness": 65,
                            "acne": 42,
                            "hydration": 83,
                            "overall": 64,
                            "analysis": "Your skin appears slightly dehydrated, especially around the cheeks and mouth area. There are a few active breakouts on your chin and forehead, and the T-zone shows mild oiliness. Overall, your skin barrier may be a bit compromised.",
                            "tips": [
                                "Use a hyaluronic acid serum after cleansing to boost hydration.",
                                "Spot-treat acne with a salicylic acid gel.",
                                "Avoid over-washing your face to preserve moisture."                           
                                ]
                            
                        }`;

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4.1',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: signedUrl,
                                },
                            },
                        ],
                    },
                ],
            });

            const result = completion.choices[0].message.content;

            // Parse the JSON response from OpenAI
            let parsedResult;
            try {
                // Remove markdown code blocks and extract JSON
                let cleanedResult = result;

                // Remove ```json and ``` if present
                cleanedResult = cleanedResult.replace(/```json\s*/g, '');
                cleanedResult = cleanedResult.replace(/```\s*$/g, '');
                cleanedResult = cleanedResult.trim();

                const jsonMatch = cleanedResult.match(/\{[\s\S]*\}/);
                const jsonString = jsonMatch ? jsonMatch[0] : cleanedResult;

                parsedResult = JSON.parse(jsonString);
            } catch (parseError) {
                console.error(
                    'Failed to parse OpenAI response as JSON:',
                    parseError
                );
                console.error('Raw response:', result);
                return res.status(500).json({
                    error: 'Invalid response format from AI service',
                    rawResponse: result,
                });
            }

            const { data: insertedFace, error: insertError } = await supabase
                .from('scanned_faces')
                .insert({
                    user_id: user_id,
                    analysis: parsedResult.analysis,
                    tips: parsedResult.tips,
                    acne: parsedResult.acne,
                    hydration: parsedResult.hydration,
                    redness: parsedResult.redness,
                    overall: parsedResult.overall,
                    image_path: img,
                })
                .select()
                .single();

            if (insertError) {
                console.error('Supabase insert error:', insertError);
                return res
                    .status(500)
                    .json({ error: 'Failed to save analysis data' });
            }

            res.status(200).json({ 
                success: true,
                result: parsedResult 
            });
        } catch (openaiError) {
            console.error('OpenAI API error:', openaiError);
            return res.status(503).json({
                error: 'AI_SERVICE_UNAVAILABLE',
                message: 'Face analysis service temporarily unavailable',
            });
        }
    } catch (err) {
        console.error('Analyze Face error:', err);
        res.status(500).json({
            error: 'Something went wrong analyzing the image',
        });
    }
});

export default router;
