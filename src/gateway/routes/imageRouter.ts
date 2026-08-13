import express from "express";

const router = express.Router();

// ── POST /api/images/txt2img ─────────────────────────────────────
// Proxies text-to-image requests to OpenAI DALL-E 3.
// Body: { prompt, negative_prompt?, width?, height?, num_inference_steps?, guidance_scale? }
// Returns: { image_url: string, seed: number }
router.post("/txt2img", async (req: express.Request, res: express.Response) => {
  try {
    const apiKey = process.env.OpenAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OpenAI_API_KEY is not configured" });
    }

    const { prompt, negative_prompt, width, height } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    // Build size string for DALL-E 3 (must be one of: 1024x1024, 1792x1024, 1024x1792)
    let size: "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024";
    if (width && height) {
      const w = Number(width);
      const h = Number(height);
      if (w >= 1500 && h < 1500) size = "1792x1024";
      else if (w < 1500 && h >= 1500) size = "1024x1792";
    }

    // Enhance prompt with negative_prompt context
    const fullPrompt = negative_prompt
      ? `${prompt}. Avoid: ${negative_prompt}`
      : prompt;

    console.log(`[ImageRouter] Generating image: "${fullPrompt.substring(0, 80)}..."`);

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: fullPrompt,
        n: 1,
        size,
        response_format: "url",
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[ImageRouter] OpenAI API error:", response.status, errorBody);
      return res.status(response.status).json({
        error: `OpenAI image generation failed: ${response.status}`,
        details: errorBody,
      });
    }

    const data = (await response.json()) as {
      data: Array<{ url: string; revised_prompt?: string }>;
    };

    const imageUrl = data.data?.[0]?.url;
    if (!imageUrl) {
      return res.status(500).json({ error: "No image URL in response" });
    }

    console.log(`[ImageRouter] Image generated successfully`);
    return res.json({
      image_url: imageUrl,
      seed: Math.floor(Math.random() * 1e9),
    });
  } catch (err: any) {
    console.error("[ImageRouter] Error:", err.message);
    return res.status(500).json({ error: err.message || "Image generation failed" });
  }
});

// ── GET /api/images/images/:filename ─────────────────────────────
// Serve generated/uploaded images (compatibility with frontend imageGen.ts)
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.resolve(__dirname, "../../../uploads");

router.get("/images/:filename", (req: express.Request, res: express.Response) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);
  res.sendFile(filePath);
});

export default router;
