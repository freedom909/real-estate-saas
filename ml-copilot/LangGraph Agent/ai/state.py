# ai/state.py

from typing import TypedDict, Optional

class ListingState(TypedDict):
    listing_id: str
    analysis: Optional[str]
    suggestions: Optional[str]
    next_action: Optional[str]