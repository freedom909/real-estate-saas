from google.genai import client
import httpx
import json
from app.core.config import NODE_API
from app.core.llm import get_model

NODE_API = "http://localhost:3000/api"
async def get_booking(booking_id: str):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{NODE_API}/booking/{booking_id}")
        return res.json()

async def cancel_booking(bookingId: str):

    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(
                f"{NODE_API}/booking/cancel",
                json={"bookingId": bookingId}
            )

            return res.json()

        except Exception as e:
            print("Booking API ERROR:", e)
            return {"error": "booking service unavailable"}

import json

async def ai_decide_tool(message: str):

    client = get_model()

    prompt = f"""
你是一个AI客服助手。

你的任务是判断用户是否需要调用工具。

可用工具：
1. cancelBooking
   参数: bookingId (string)

2. getBooking
   参数: bookingId (string)

规则：
- 如果用户想取消订单 → 使用 cancelBooking
- 如果用户查询订单 → 使用 getBooking
- 如果不需要工具 → 返回 none

⚠️ 必须只返回 JSON，不要解释！

格式如下：
{{
  "tool": "cancelBooking",
  "args": {{
    "bookingId": "123"
  }}
}}

用户输入：
{message}
"""

    response =await client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    text = response.text.strip()

    try:
        return json.loads(text)
    except:
        return {"tool": "none"}


           
           