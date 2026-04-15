# app/agents/graph_agent.py

from langgraph.graph import StateGraph, END
from typing import TypedDict

class AgentState(TypedDict):
    listing_id: str
    performance: dict
    optimized: bool


def get_performance(state: AgentState):
    return {
        "performance": {
            "conversion_rate": 2.1
        }
    }


def decide(state: AgentState):
    if state["performance"]["conversion_rate"] < 3:
        return "optimize"
    return END


def optimize(state: AgentState):
    return {"optimized": True}


builder = StateGraph(AgentState)
builder.add_node("get_performance", get_performance)
builder.add_node("optimize", optimize)

builder.set_entry_point("get_performance")

builder.add_conditional_edges(
    "get_performance",
    decide,
    {
        "optimize": "optimize",
        END: END
    }
)

builder.add_edge("optimize", END)

graph = builder.compile()