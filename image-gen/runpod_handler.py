import runpod
import torch
import base64
import io
from PIL import Image
from diffusers import StableDiffusionPipeline, AutoPipelineForInpainting, AutoPipelineForImage2Image

# Global pipelines (loaded once on cold start)
_pipe = None
_img2img_pipe = None
_inpaint_pipe = None


def load_pipelines():
    global _pipe, _img2img_pipe, _inpaint_pipe

    if _pipe is None:
        _pipe = StableDiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            torch_dtype=torch.float16,
            variant="fp16",
        )
        _pipe.enable_attention_slicing()
        _pipe.enable_vae_slicing()
        _pipe = _pipe.to("cuda")

    if _img2img_pipe is None:
        _img2img_pipe = AutoPipelineForImage2Image.from_pipe(_pipe)

    if _inpaint_pipe is None:
        _inpaint_pipe = AutoPipelineForInpainting.from_pretrained(
            "runwayml/stable-diffusion-inpainting",
            torch_dtype=torch.float16,
            variant="fp16",
        )
        _inpaint_pipe.enable_attention_slicing()
        _inpaint_pipe.enable_vae_slicing()
        _inpaint_pipe = _inpaint_pipe.to("cuda")


def decode_image(b64_string: str) -> Image.Image:
    image_data = base64.b64decode(b64_string)
    return Image.open(io.BytesIO(image_data)).convert("RGB")


def encode_image(image: Image.Image) -> str:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def handler(job):
    job_input = job["input"]
    job_type = job_input.get("type", "txt2img")

    load_pipelines()

    try:
        seed = job_input.get("seed")
        if seed is None:
            seed = torch.randint(0, 2**32, (1,)).item()
        generator = torch.Generator(device="cuda").manual_seed(seed)

        if job_type == "txt2img":
            result = _pipe(
                prompt=job_input["prompt"],
                negative_prompt=job_input.get("negative_prompt", "blurry, low quality"),
                width=job_input.get("width", 512),
                height=job_input.get("height", 512),
                num_inference_steps=job_input.get("num_inference_steps", 30),
                guidance_scale=job_input.get("guidance_scale", 7.5),
                generator=generator,
            )
            image = result.images[0]

        elif job_type == "img2img":
            init_image = decode_image(job_input["image"]).resize((512, 512))
            result = _img2img_pipe(
                prompt=job_input["prompt"],
                negative_prompt=job_input.get("negative_prompt", "blurry, low quality"),
                image=init_image,
                strength=job_input.get("strength", 0.75),
                num_inference_steps=job_input.get("num_inference_steps", 30),
                guidance_scale=job_input.get("guidance_scale", 7.5),
                generator=generator,
            )
            image = result.images[0]

        elif job_type == "inpaint":
            init_image = decode_image(job_input["image"]).resize((512, 512))
            mask_image = decode_image(job_input["mask"]).resize((512, 512)).convert("L")
            result = _inpaint_pipe(
                prompt=job_input["prompt"],
                negative_prompt=job_input.get("negative_prompt", "blurry, low quality"),
                image=init_image,
                mask_image=mask_image,
                strength=job_input.get("strength", 0.75),
                num_inference_steps=job_input.get("num_inference_steps", 30),
                guidance_scale=job_input.get("guidance_scale", 7.5),
                generator=generator,
            )
            image = result.images[0]

        else:
            return {"error": f"Unknown job type: {job_type}"}

        return {
            "image": encode_image(image),
            "seed": seed,
        }

    except Exception as e:
        return {"error": str(e)}


runpod.serverless.start({"handler": handler})
