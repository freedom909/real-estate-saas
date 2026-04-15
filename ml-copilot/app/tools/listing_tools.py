# app/tools/listing_tools.py

from langchain.tools import tool

@tool
def get_listing_performance(listing_id: str):
    """Get performance metrics for a listing"""
    
    # 👉 实际可以调用 Node API / DB
    return {
        "listing_id": listing_id,
        "conversion_rate": 2.1,
        "views": 1200,
        "bookings": 25
    }


@tool
def optimize_listing(listing_id: str):
    """Optimize listing title and description"""
    
    # 👉 实际可以调用你的 AI service
    return {
        "status": "success",
        "message": f"Listing {listing_id} optimized"
    }