from google.genai import client
import httpx
import json
from app.core.config import NODE_API
from app.core.llm import get_model

NODE_API = "http://localhost:3000/api"
GRAPHQL_URL = "http://localhost:4000/graphql"

async def get_booking(booking_id: str):
    async with httpx.AsyncClient() as http_client:
        query = """
        query GetBooking($id: ID!) {
            booking(id: $id) {
                id
                status
                price
                checkInDate
                checkOutDate
                listingId
                customerId
            }
        }
        """
        res = await http_client.post(
            GRAPHQL_URL,
            json={"query": query, "variables": {"id": booking_id}}
        )
        return res.json().get("data", {}).get("booking", {})

async def cancel_booking(booking_id: str):
    async with httpx.AsyncClient() as http_client:
        mutation = """
        mutation CancelBooking($id: ID!, $reason: String) {
            cancelBooking(id: $id, reason: $reason) {
                success
                message
                booking {
                    id
                    status
                }
            }
        }
        """
        res = await http_client.post(
            GRAPHQL_URL,
            json={
                "query": mutation,
                "variables": {"id": booking_id, "reason": "Cancelled via AI assistant"}
            }
        )
        return res.json().get("data", {}).get("cancelBooking", {})

async def create_booking(listing_id: str, customer_id: str, check_in_date: str, check_out_date: str, customer_count: int = 1):
    async with httpx.AsyncClient() as http_client:
        mutation = """
        mutation CreateBooking($input: CreateBookingInput!) {
            createBooking(input: $input) {
                success
                message
                booking {
                    id
                    status
                    price
                    checkInDate
                    checkOutDate
                    listingId
                    customerId
                }
            }
        }
        """
        variables = {
            "input": {
                "listingId": listing_id,
                "customerId": customer_id,
                "checkInDate": check_in_date,
                "checkOutDate": check_out_date,
                "customerCount": customer_count,
            }
        }
        try:
            res = await http_client.post(
                GRAPHQL_URL,
                json={"query": mutation, "variables": variables}
            )
            data = res.json()
            if "errors" in data:
                return {"error": data["errors"][0].get("message", "GraphQL error")}
            return data.get("data", {}).get("createBooking", {})
        except Exception as e:
            print("Create Booking API ERROR:", e)
            return {"error": "booking service unavailable"}

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

3. createBooking
   参数: listingId (string), customerId (string), checkInDate (string), checkOutDate (string), customerCount (int, 默认1)

规则：
- 如果用户想取消订单 → 使用 cancelBooking
- 如果用户查询订单 → 使用 getBooking
- 如果用户想创建/预约订单（包含日期、民宿信息） → 使用 createBooking
- 如果不需要工具 → 返回 none

⚠️ 必须只返回 JSON，不要解释！

格式如下：
{{
  "tool": "createBooking",
  "args": {{
    "listingId": "123",
    "customerId": "456",
    "checkInDate": "2024-07-25",
    "checkOutDate": "2024-07-27",
    "customerCount": 1
  }}
}}

用户输入：
{message}
"""

    response = await client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    text = response.text.strip()

    try:
        return json.loads(text)
    except:
        return {"tool": "none"}


           
           