from app.core.llm import get_model
from app.memory.memory_service import MemoryService
from app.tools.tool_router import execute_tool
from app.cache.cache_service import CacheService
from app.rules.rule_engine import RuleEngine

cache = CacheService()
rule_engine = RuleEngine()
memory = MemoryService()

class AgentService:

    def decide_tool(self, message: str):
        if "取消" in message:
            return {
            "tool": "cancelBooking",
            "args": {"bookingId": "123"}
        }
        elif "订单" in message:
            return {
            "tool": "getBooking",
            "args": {"bookingId": "123"}
        }
        else:
            return {
            "tool": "none",
            "args": {}
        }


    async def run(self, message: str, user_id: str):

        # ✅ memory
        try:
            # ✅ 1. Rule Engine
            decision = rule_engine.match(message)
            if decision:
                result=await execute_tool(decision["tool"], decision["args"])
                reply = f"処理結果: {result}"
            
            else:
                # ✅ 2. Cache
                cached_result = cache.get(message)
                if cached_result:
                    reply = cached_result
                # ✅ 3. fallback（mock AI）
                reply = "こんにちは！ご用件を教えてください。"
                cache.set(message, reply)

        except Exception as e:
            print("AGENT ERROR:", e)

            if "取消" in message:
                reply = "ご注文はキャンセルされました。（mock）"
            else:
                reply = "こんにちは！（mock）"

        memory.add_message(user_id, {"role": "user", "content": message})
        memory.add_message(user_id, {"role": "assistant", "content": reply})

        return reply
            