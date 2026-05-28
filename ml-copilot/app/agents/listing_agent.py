# app/agents/listing_agent.py

from langchain_openai import ChatOpenAI
from langchain.agents import initialize_agent, AgentType
from app.tools.listing_tools import (
    get_listing_performance,
    optimize_listing
)

llm = ChatOpenAI(model="gpt-4o-mini")

tools = [
    get_listing_performance,
    optimize_listing
]

agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.OPENAI_FUNCTIONS,
    verbose=True
)