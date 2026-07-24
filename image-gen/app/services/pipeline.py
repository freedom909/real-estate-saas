import torch
from diffusers import StableDiffusionPipeline, AutoPipelineForImage2Image, AutoPipelineForInpainting
from app.core.config import get_settings

_settings = get_settings()
_pipe = None
_img2img_pipe = None
_inpaint_pipe = None


def get_pipeline() -> StableDiffusionPipeline:
    global _pipe
    if _pipe is None:
        _pipe = StableDiffusionPipeline.from_pretrained(
            _settings.model_id,
            torch_dtype=torch.float16 if _settings.dtype == "float16" else torch.float32,
            variant="fp16" if _settings.dtype == "float16" else None,
        )
        _pipe.enable_attention_slicing()
        _pipe.enable_vae_slicing()
        _pipe = _pipe.to(_settings.device)
    return _pipe


def get_img2img_pipeline() -> AutoPipelineForImage2Image:
    global _img2img_pipe
    if _img2img_pipe is None:
        pipe = get_pipeline()
        _img2img_pipe = AutoPipelineForImage2Image.from_pipe(pipe)
    return _img2img_pipe


def get_inpaint_pipeline() -> AutoPipelineForInpainting:
    global _inpaint_pipe
    if _inpaint_pipe is None:
        _inpaint_pipe = AutoPipelineForInpainting.from_pretrained(
            "runwayml/stable-diffusion-inpainting",
            torch_dtype=torch.float16 if _settings.dtype == "float16" else torch.float32,
            variant="fp16" if _settings.dtype == "float16" else None,
        )
        _inpaint_pipe.enable_attention_slicing()
        _inpaint_pipe.enable_vae_slicing()
        _inpaint_pipe = _inpaint_pipe.to(_settings.device)
    return _inpaint_pipe
