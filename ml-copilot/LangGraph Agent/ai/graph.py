# ai/graph.py

from langgraph.graph import StateGraph, END
from ai.state import ListingState
from ai.agent import agent

def run_agent(state: ListingState):
    result = agent.invoke({
        "input": f"Analyze and improve listing {state['listing_id']}"
    })

    return {
        "analysis": result["output"]
    }

builder = StateGraph(ListingState)

builder.add_node("agent", run_agent)

builder.set_entry_point("agent")
builder.add_edge("agent", END)

graph = builder.compile()