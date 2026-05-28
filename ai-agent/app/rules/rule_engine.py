import re

class RuleEngine:

    def match(self, message: str):

        if "取消" in message:
            return {
                "tool": "cancelBooking",
                "args": {"bookingId": self._extract_id(message)}
            }

        if "订单" in message:
            return {
                "tool": "getBooking",
                "args": {"bookingId": self._extract_id(message)}
            }

        return None

    def _extract_id(self, text: str):
        match = re.search(r"\d+", text)
        return match.group() if match else "123"