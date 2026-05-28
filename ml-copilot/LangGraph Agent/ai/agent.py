# ai/agent.py

from langchain_openai import ChatOpenAI
from langchain.agents import initialize_agent, AgentType
from ai.tools.listing_tools import analyze_listing, suggest_title, suggest_description

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

tools = [
    analyze_listing,
    suggest_title,
    suggest_description
]

agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.OPENAI_FUNCTIONS,  # 🔥 Function Calling
    verbose=True
)