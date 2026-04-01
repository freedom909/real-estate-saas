from fastapi import APIRouter
from app.services.agent_service import AgentService
from app.models.schemas import ChatRequest

router = APIRouter()
agent = AgentService()

@router.post("/chat")
async def chat(req: ChatRequest):
    reply = await agent.run(req.message, req.userId)
    return {"reply": reply}