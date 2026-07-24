const IMAGE_API_URL = process.env.NEXT_PUBLIC_IMAGE_API_URL || "http://localhost:8000";

export interface TextToImageParams {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
}

export interface Img2ImgParams {
  prompt: string;
  negative_prompt?: string;
  strength?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
}

export interface InpaintParams {
  prompt: string;
  negative_prompt?: string;
  strength?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
}

export interface ImageResponse {
  image_url: string;
  seed: number;
}

export async function textToImage(params: TextToImageParams): Promise<ImageResponse> {
  const res = await fetch(`${IMAGE_API_URL}/api/images/txt2img`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to generate image");
  return res.json();
}

export async function imageToImage(
  params: Img2ImgParams,
  imageFile: File
): Promise<ImageResponse> {
  const formData = new FormData();
  formData.append("req", JSON.stringify(params));
  formData.append("image", imageFile);

  const res = await fetch(`${IMAGE_API_URL}/api/images/img2img`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to generate image");
  return res.json();
}

export async function inpaint(
  params: InpaintParams,
  imageFile: File,
  maskFile: File
): Promise<ImageResponse> {
  const formData = new FormData();
  formData.append("req", JSON.stringify(params));
  formData.append("image", imageFile);
  formData.append("mask", maskFile);

  const res = await fetch(`${IMAGE_API_URL}/api/images/inpaint`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to inpaint image");
  return res.json();
}

export function getImageUrl(filename: string): string {
  return `${IMAGE_API_URL}/api/images/images/${filename}`;
}
