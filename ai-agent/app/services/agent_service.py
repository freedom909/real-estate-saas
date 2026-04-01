from app.core.llm import get_model
from app.memory.memory_service import MemoryService
from app.tools.tool_router import execute_tool

memory = MemoryService()

class AgentService:

    def decide_tool(self, message: str):
        if "取消" in message:
            return "cancelBooking", {"bookingId": "123"}
        elif "订单" in message:
            return "getBooking", {"bookingId": "123"}
        else:
            return None, None

    async def run(self, message: str, user_id: str):
        # ✅ memory
        try:
            history = memory.get_history(user_id)
            decision = self.ai_decide_tool(message)
            tool_name, args = decision["tool"], decision["args"]
            if tool_name and tool_name != "none":
                result = await execute_tool(tool_name, args)
                reply = f"処理結果: {result}"
            else:
                reply = "こんにちは！ご用件を教えてください。（mock）"
              

        except Exception as e:
            print("MEMORY ERROR:", e)
            history = []

        # 🔥 Step 1：决定是否调用 tool
        tool_name, args = self.decide_tool(message)

        if tool_name:
            result = await execute_tool(tool_name, args)

            reply = f"処理結果: {result}"

        else:
            # 👉 fallback AI / mock
            try:
                client = get_model()

                response = await client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=message
                )

                reply = response.text.replace("```json", "").replace("```", "").strip()
            except Exception as e:
                print("AI ERROR:", e)
                reply = "こんにちは！ご用件を教えてください。（mock）"

        # ✅ memory
        memory.add_message(user_id, {"role": "user", "content": message})
        memory.add_message(user_id, {"role": "assistant", "content": reply})

        return reply