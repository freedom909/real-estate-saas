import httpx
from app.core.config import NODE_API

async def get_booking(booking_id: str):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{NODE_API}/booking/{booking_id}")
        return res.json()

async def cancel_booking(booking_id: str):
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{NODE_API}/booking/cancel", json={
            "bookingId": booking_id
        })
        return res.json()