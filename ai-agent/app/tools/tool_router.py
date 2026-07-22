from app.tools.booking_tool import get_booking, cancel_booking, create_booking

async def execute_tool(name: str, args: dict):
    if name == "getBooking":
        return await get_booking(args["bookingId"])

    if name == "cancelBooking":
        return await cancel_booking(args["bookingId"])

    if name == "createBooking":
        return await create_booking(
            listing_id=args["listingId"],
            customer_id=args.get("customerId", ""),
            check_in_date=args["checkInDate"],
            check_out_date=args["checkOutDate"],
            customer_count=args.get("customerCount", 1),
        )

    return {"error": "Unknown tool"}