import re
from datetime import datetime

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

        if "予約" in message or "预约" in message or "book" in message.lower():
            dates = self._extract_dates(message)
            if dates:
                return {
                    "tool": "createBooking",
                    "args": {
                        "listingId": "default",
                        "customerId": "",
                        "checkInDate": dates["checkIn"],
                        "checkOutDate": dates["checkOut"],
                        "customerCount": 1,
                    }
                }

        return None

    def _extract_id(self, text: str):
        match = re.search(r"\d+", text)
        return match.group() if match else "123"

    def _extract_dates(self, text: str):
        # Try to find date patterns like "7月25日から7月27日" or "7/25-7/27"
        patterns = [
            r"(\d{1,2})月(\d{1,2})日?から(\d{1,2})月(\d{1,2})日?",
            r"(\d{1,2})/(\d{1,2})\s*(?:から|～|~|-)\s*(\d{1,2})/(\d{1,2})",
            r"(\d{1,4})-(\d{1,2})-(\d{1,2})\s*(?:to|～|~|-)\s*(\d{1,4})-(\d{1,2})-(\d{1,2})",
        ]

        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                groups = match.groups()
                try:
                    if len(groups) == 4:
                        # MM/DD - MM/DD format
                        month1, day1, month2, day2 = groups
                        year = datetime.now().year
                        check_in = f"{year}-{int(month1):02d}-{int(day1):02d}"
                        check_out = f"{year}-{int(month2):02d}-{int(day2):02d}"
                        return {"checkIn": check_in, "checkOut": check_out}
                    elif len(groups) == 6:
                        # YYYY-MM-DD - YYYY-MM-DD format
                        check_in = f"{groups[0]}-{int(groups[1]):02d}-{int(groups[2]):02d}"
                        check_out = f"{groups[3]}-{int(groups[4]):02d}-{int(groups[5]):02d}"
                        return {"checkIn": check_in, "checkOut": check_out}
                except (ValueError, IndexError):
                    continue

        return None