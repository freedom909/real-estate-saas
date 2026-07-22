from app.core.llm import get_model
from app.memory.memory_service import MemoryService
from app.tools.tool_router import execute_tool
from app.tools.booking_tool import ai_decide_tool
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
                if "error" in result:
                    reply = f"申し訳ございません。処理中にエラーが発生しました: {result.get('error', '不明なエラー')}"
                elif decision["tool"] == "createBooking":
                    booking = result.get("booking", {})
                    if booking.get("id"):
                        reply = f"予約が完了しました！予約ID: {booking['id']}。チェックイン: {booking.get('checkInDate', 'N/A')}, チェックアウト: {booking.get('checkOutDate', 'N/A')}。合計金額: ¥{booking.get('price', 0)}"
                    else:
                        reply = f"予約処理結果: {result}"
                else:
                    reply = f"処理結果: {result}"
            else:
                # ✅ 2. Cache
                cached_result = cache.get(message)
                if cached_result:
                    reply = cached_result
                else:
                    # ✅ 3. AI決策ツール
                    tool_decision = await ai_decide_tool(message)
                    if tool_decision.get("tool") and tool_decision["tool"] != "none":
                        result = await execute_tool(tool_decision["tool"], tool_decision["args"])
                        if "error" in result:
                            reply = f"申し訳ございません。処理中にエラーが発生しました: {result.get('error', '不明なエラー')}"
                        elif tool_decision["tool"] == "createBooking":
                            booking = result.get("booking", {})
                            if booking.get("id"):
                                reply = f"予約が完了しました！予約ID: {booking['id']}。チェックイン: {booking.get('checkInDate', 'N/A')}, チェックアウト: {booking.get('checkOutDate', 'N/A')}。合計金額: ¥{booking.get('price', 0)}"
                            else:
                                reply = f"予約処理結果: {result}"
                        else:
                            reply = f"処理結果: {result}"
                        cache.set(message, reply)
                    else:
                        # ✅ 4. fallback（mock AI）
                        reply = "こんにちは！ご用件を教えてください。"
                        cache.set(message, reply)

        except Exception as e:
            print("AGENT ERROR:", e)

            if "取消" in message:
                reply = "ご注文はキャンセルされました。（mock）"
            elif "予約" in message or "预约" in message or "book" in message.lower():
                reply = "申し訳ございません。予約処理中にエラーが発生しました。もう一度お試しください。"
            else:
                reply = "こんにちは！（mock）"

        memory.add_message(user_id, {"role": "user", "content": message})
        memory.add_message(user_id, {"role": "assistant", "content": reply})

        return reply
            