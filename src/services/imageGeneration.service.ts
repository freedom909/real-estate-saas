const IMAGE_API_URL = process.env.IMAGE_GEN_API_URL || "http://localhost:8000";

export interface GenerateImagesInput {
  title: string;
  description: string;
  address: string;
}

export async function generateListingImages(input: GenerateImagesInput): Promise<string[]> {
  const prompts = [
    `${input.title} exterior view, professional real estate photography, bright daylight`,
    `${input.title} interior living room, spacious, modern furniture, natural lighting`,
    `${input.title} bedroom, cozy, clean design, professional photography`,
  ];

  const images: string[] = [];

  for (const prompt of prompts) {
    try {
      const res = await fetch(`${IMAGE_API_URL}/api/images/txt2img`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          negative_prompt: "blurry, low quality, distorted, ugly, watermark",
          width: 512,
          height: 512,
          num_inference_steps: 30,
          guidance_scale: 7.5,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        images.push(data.image_url);
      }
    } catch (e) {
      console.error("Image generation failed:", e);
    }
  }

  return images;
}
