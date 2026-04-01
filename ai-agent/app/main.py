from fastapi import FastAPI
from app.api.chat import router as chat_router

app = FastAPI(title="AI Agent Service")

app.include_router(chat_router, prefix="/api")

@app.get("/")
def root():
    return {"status": "AI Agent running"}