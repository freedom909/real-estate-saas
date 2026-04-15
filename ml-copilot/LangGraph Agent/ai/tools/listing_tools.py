# ai/tools/listing_tools.py

from langchain.tools import tool

@tool
def analyze_listing(listing_id: str) -> str:
    """
    Analyze listing performance
    """
    # TODO: call DB / service
    return f"Listing {listing_id} has low conversion rate"

@tool
def suggest_title(listing_id: str) -> str:
    return "🔥 Modern Cozy Apartment Near Shibuya"

@tool
def suggest_description(listing_id: str) -> str:
    return "A beautiful modern apartment located in Shibuya, Tokyo."
