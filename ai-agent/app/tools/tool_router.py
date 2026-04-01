from app.tools.booking_tool import get_booking, cancel_booking

async def execute_tool(name: str, args: dict):
    if name == "getBooking":
        return await get_booking(args["bookingId"])

    if name == "cancelBooking":
        return await cancel_booking(args["bookingId"])

    if name == "cancelBooking":
        return {"status": "CANCELLED", "bookingId": args["bookingId"]}

    if name == "getBooking":
        return {"status": "CONFIRMED", "bookingId": args["bookingId"]}
    return {"error": "Unknown tool"}