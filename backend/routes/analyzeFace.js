import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        // Validate environment variables
        if (
            !process.env.SUPABASE_URL ||
            !process.env.SUPABASE_SERVICE_ROLE_KEY ||
            !process.env.OPENAI_API_KEY
        ) {
            //console.error('Missing required environment variables');
            return res
                .status(500)
                .json({ error: 'Server configuration error' });
        }

        // Initialize clients with error handling
        let supabase, openai;
        try {
            supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );
            openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        } catch (clientError) {
            //console.error('Failed to initialize clients:', clientError);
            return res
                .status(500)
                .json({ error: 'Service initialization failed' });
        }

        const { img, user_id } = req.body;

        if (!img || !user_id) {
            return res.status(400).json({ error: 'Missing image or user_id' });
        }

        // Fetch skin_type and skin_concerns
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('skin_type, skin_concerns')
            .eq('user_id', user_id)
            .single();

        if (profileError || !profile) {
            //console.error('Profile fetch error:', profileError);
            return res
                .status(500)
                .json({ error: 'Failed to fetch user profile' });
        }

        const { skin_type, skin_concerns } = profile;

        // Validate skin_concerns is an array
        const concernsArray = Array.isArray(skin_concerns) ? skin_concerns : [];

        // Create signed URL
        const { data: signedUrlData, error: signedUrlError } =
            await supabase.storage
                .from('face-images')
                .createSignedUrl(img, 60 * 60);

        if (signedUrlError || !signedUrlData?.signedUrl) {
            //console.error('Signed URL error:', signedUrlError);
            return res.status(500).json({ error: 'Failed to process image' });
        }

        const signedUrl = signedUrlData.signedUrl;

        // Face validation check
        const checkPrompt = `Given an image, is this a picture of a full face? If it is bad lighting respond false
                         Respond ONLY with JSON: { "is_face": true } or { "is_face": false }.`;

        let checkCompletion;
        try {
            checkCompletion = await openai.chat.completions.create({
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
        } catch (openaiError) {
            //console.error('OpenAI face check error:', openaiError);
            return res.status(500).json({ error: 'Face validation failed' });
        }

        //console.log(checkCompletion.choices[0].message.content);

        let isFace;
        try {
            const content =
                checkCompletion.choices[0]?.message?.content?.trim();
            if (!content) {
                throw new Error('Empty response from AI');
            }
            isFace = JSON.parse(content);
        } catch (parseError) {
            //console.error('Failed to parse face check response:', parseError);
            return res
                .status(500)
                .json({ error: 'Face validation processing failed' });
        }

        if (!isFace?.is_face) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_FACE_IMAGE',
                    message: 'This does not appear to be an image of a face',
                },
            });
        }

        // Main analysis
        const prompt = `Analyze this face for skin quality. Avoid sugarcoating, give clear, accurate feedback and provide truthful, unbiased analysis. 
                        Skin type: ${skin_type || 'Unknown'}. Concerns: ${
            concernsArray.join(', ') || 'None specified'
        }. 
                        Rate redness, acne, hydration and give an overall score from 1-100. For all metrics 1 is the worst and 100 is the best. Provide a detailed analysis and any tips if any.
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

        let completion;
        try {
            completion = await openai.chat.completions.create({
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
        } catch (openaiError) {
            //console.error('OpenAI analysis error:', openaiError);
            return res.status(500).json({ error: 'Skin analysis failed' });
        }

        const result = completion.choices[0]?.message?.content;
        if (!result) {
            //console.error('Empty response from OpenAI analysis');
            return res
                .status(500)
                .json({ error: 'Analysis processing failed' });
        }

        // Parse the JSON response from OpenAI
        let parsedResult;
        try {
            // Remove markdown code blocks and extract JSON
            let cleanedResult = result
                .replace(/```json\s*/g, '')
                .replace(/```\s*$/g, '')
                .trim();
            const jsonMatch = cleanedResult.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : cleanedResult;
            parsedResult = JSON.parse(jsonString);

            // Validate required fields
            if (
                typeof parsedResult.redness !== 'number' ||
                typeof parsedResult.acne !== 'number' ||
                typeof parsedResult.hydration !== 'number' ||
                typeof parsedResult.overall !== 'number' ||
                typeof parsedResult.analysis !== 'string' ||
                !Array.isArray(parsedResult.tips)
            ) {
                throw new Error('Invalid response structure');
            }
        } catch (parseError) {
            //console.error('Failed to parse OpenAI analysis response:', parseError);
            //console.error('Raw response:', result);
            return res
                .status(500)
                .json({ error: 'Analysis result processing failed' });
        }

        // Save to database
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
            //console.error('Database insert error:', insertError);
            return res
                .status(500)
                .json({ error: 'Failed to save analysis results' });
        }

        res.status(200).json({
            success: true,
            result: parsedResult,
        });
    } catch (err) {
        //console.error('Unexpected error in analyze face route:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
