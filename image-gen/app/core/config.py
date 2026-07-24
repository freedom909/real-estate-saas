from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    model_id: str = "runwayml/stable-diffusion-v1-5"
    device: str = "cuda"
    dtype: str = "float16"
    output_dir: str = "./outputs"
    max_batch_size: int = 4

    class Config:
        env_prefix = "IMAGE_GEN_"


@lru_cache
def get_settings() -> Settings:
    return Settings()
