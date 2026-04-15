from fastapi import FastAPI
from pydantic import BaseModel

from langchain_openai import ChatOpenAI
from langchain.agents import initialize_agent, AgentType
from langchain.tools import tool

# ========== Tools ==========

@tool
def analyze_listing(listing_id: str) -> str:
    """Analyze a listing performance and return insights."""
    return f"[REAL DATA] Listing {listing_id} conversion rate is LOW (2.1%)"


@tool
def optimize_listing(listing_id: str) -> str:
    """Optimize listing title and description."""
    return f"[REAL ACTION] Improve title, add photos, adjust price for {listing_id}"

tools = [analyze_listing, optimize_listing]

# ========== Agent ==========
def create_agent():
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    agent = initialize_agent(
        tools,
        llm,
        agent=AgentType.OPENAI_FUNCTIONS,
        verbose=True
    )

    return agent

agent = create_agent()

# ========== FastAPI ==========
app = FastAPI()

class Request(BaseModel):
    input: str

@app.get("/")
def root():
    return {"message": "Copilot is running"}

@app.post("/copilot/ask")
def ask(req: Request):
    result = agent.run(req.input)

    return {
        "response": result
    }

@app.post("/ai/listing-agent")
async def listing_agent(payload: dict):
    result = graph.invoke({
        "listing_id": payload["listingId"]
    })

    return {
        "result": result
    }    