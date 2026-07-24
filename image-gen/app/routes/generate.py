import uuid
import torch
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
from PIL import Image
from pathlib import Path

from app.schemas.image import TextToImageRequest, Img2ImgRequest, InpaintRequest, ImageResponse
from app.services.pipeline import get_pipeline, get_img2img_pipeline, get_inpaint_pipeline
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()


def _save_image(image: Image.Image, seed: int) -> str:
    output_dir = Path(settings.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}.png"
    filepath = output_dir / filename
    image.save(filepath)
    return str(filepath)


@router.post("/txt2img", response_model=ImageResponse)
def text_to_image(req: TextToImageRequest):
    pipe = get_pipeline()

    generator = None
    seed = req.seed if req.seed is not None else torch.randint(0, 2**32, (1,)).item()
    generator = torch.Generator(device=settings.device).manual_seed(seed)

    result = pipe(
        prompt=req.prompt,
        negative_prompt=req.negative_prompt,
        width=req.width,
        height=req.height,
        num_inference_steps=req.num_inference_steps,
        guidance_scale=req.guidance_scale,
        generator=generator,
    )

    image = result.images[0]
    filepath = _save_image(image, seed)

    return ImageResponse(image_url=filepath, seed=seed)


@router.post("/img2img", response_model=ImageResponse)
async def image_to_image(
    req: Img2ImgRequest,
    image: UploadFile = File(...),
):
    pipe = get_img2img_pipeline()

    init_image = Image.open(image.file).convert("RGB").resize((512, 512))

    generator = None
    seed = req.seed if req.seed is not None else torch.randint(0, 2**32, (1,)).item()
    generator = torch.Generator(device=settings.device).manual_seed(seed)

    result = pipe(
        prompt=req.prompt,
        negative_prompt=req.negative_prompt,
        image=init_image,
        strength=req.strength,
        num_inference_steps=req.num_inference_steps,
        guidance_scale=req.guidance_scale,
        generator=generator,
    )

    output_image = result.images[0]
    filepath = _save_image(output_image, seed)

    return ImageResponse(image_url=filepath, seed=seed)


@router.post("/inpaint", response_model=ImageResponse)
async def inpaint(
    req: InpaintRequest,
    image: UploadFile = File(...),
    mask: UploadFile = File(...),
):
    pipe = get_inpaint_pipeline()

    init_image = Image.open(image.file).convert("RGB").resize((512, 512))
    mask_image = Image.open(mask.file).convert("L").resize((512, 512))

    generator = None
    seed = req.seed if req.seed is not None else torch.randint(0, 2**32, (1,)).item()
    generator = torch.Generator(device=settings.device).manual_seed(seed)

    result = pipe(
        prompt=req.prompt,
        negative_prompt=req.negative_prompt,
        image=init_image,
        mask_image=mask_image,
        strength=req.strength,
        num_inference_steps=req.num_inference_steps,
        guidance_scale=req.guidance_scale,
        generator=generator,
    )

    output_image = result.images[0]
    filepath = _save_image(output_image, seed)

    return ImageResponse(image_url=filepath, seed=seed)


@router.get("/images/{filename}")
def get_image(filename: str):
    filepath = Path(settings.output_dir) / filename
    if not filepath.exists():
        return {"error": "Image not found"}
    return FileResponse(filepath, media_type="image/png")
