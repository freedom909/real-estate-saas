const IMAGE_API_URL = process.env.NEXT_PUBLIC_IMAGE_API_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4000";

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

/**
 * Convert a raw image_url from the image-gen API into a browsable URL.
 * The API returns local filesystem paths like "./outputs/abc.png".
 * We need to convert them to "http://localhost:4000/api/images/images/abc.png".
 */
function toBrowsableUrl(rawUrl: string): string {
  if (rawUrl.startsWith("http")) return rawUrl;
  // Extract just the filename from the path (e.g. "./outputs/abc.png" → "abc.png")
  const filename = rawUrl.split(/[/\\]/).pop() || rawUrl;
  return `${IMAGE_API_URL}/api/images/images/${encodeURIComponent(filename)}`;
}

export async function textToImage(params: TextToImageParams): Promise<ImageResponse> {
  const res = await fetch(`${IMAGE_API_URL}/api/images/txt2img`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to generate image");
  const data = await res.json();
  data.image_url = toBrowsableUrl(data.image_url);
  return data;
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
  const data = await res.json();
  data.image_url = toBrowsableUrl(data.image_url);
  return data;
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
  if (!res.ok) throw new Error("Failed to generate image");
  const data = await res.json();
  data.image_url = toBrowsableUrl(data.image_url);
  return data;
}

export function getImageUrl(filename: string): string {
  return `${IMAGE_API_URL}/api/images/images/${filename}`;
}
