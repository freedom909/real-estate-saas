from fastapi import FastAPI
from app.routes.generate import router as generate_router

app = FastAPI(title="Image Generation Service")

app.include_router(generate_router, prefix="/api/images")


@app.get("/")
def root():
    return {"status": "Image Generation Service running"}


@app.get("/health")
def health():
    return {"status": "healthy"}
