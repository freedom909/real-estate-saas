import json
from typing import List, Dict, Any
from google.genai import types
from app.core.llm import get_model
from app.services.tool_router import execute_tool
from app.memory.memory_service import MemoryService

memory = MemoryService()

class AgentService:
    async def run(self, message: str, user_id: str) -> str:
        # 1. 定义系统指令
        system_instruction = """
你是一个短租平台客服。
规则：
- 用户问订单 → 调用 getBooking
- 用户要取消 → 调用 cancelBooking
- 不要编造数据
- 信息不够必须提问
- 用日语回答
"""

        # 2. 定义工具
        tools = [{
            "function_declarations": [
                {
                    "name": "getBooking",
                    "description": "获取订单信息",
                    "parameters": {
                        "type": "OBJECT",
                        "properties": {
                            "bookingId": {"type": "STRING"}
                        },
                        "required": ["bookingId"]
                    }
                },
                {
                    "name": "cancelBooking",
                    "description": "取消订单",
                    "parameters": {
                        "type": "OBJECT",
                        "properties": {
                            "bookingId": {"type": "STRING"}
                        },
                        "required": ["bookingId"]
                    }
                }
            ]
        }]

        # 3. 初始化 Gemini 模型
        client = get_model()
        config = types.GenerateContentConfig(
            tools=tools,
            system_instruction=system_instruction
        )

        # 4. 更新内存
        user_input = {"role": "user", "parts": [message]}
        memory.add_message(user_id, user_input)

        # 5. 开启对话/生成回复循环
        while True:
            history = memory.get_history(user_id)
            # 调用 Gemini (基于 google-genai SDK)
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=history,
                config=config
            )
            
            msg = response.candidates[0].content
            memory.add_message(user_id, msg)

            # 检查是否有工具调用请求
            function_calls = [part.function_call for part in msg.parts if part.function_call]
            
            if not function_calls:
                return "".join([part.text for part in msg.parts if part.text is not None])

            # 处理工具执行
            tool_responses = []
            for fc in function_calls:
                args = {k: v for k, v in fc.args.items()}
                result = await execute_tool(fc.name, args)
                
                tool_responses.append(types.Part.from_function_response(
                    name=fc.name,
                    response={'result': result}
                ))
            
            # 工具执行结果必须作为下一轮的 'user' 角色返回给模型
            memory.add_message(user_id, {"role": "user", "parts": tool_responses})