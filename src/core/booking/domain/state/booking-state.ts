// src/core/booking/domain/state/booking-state.ts

export enum BookingState {
    IDLE = "idle",
    AWAITING_LISTING = "awaiting_listing",
    AWAITING_DATES = "awaiting_dates",
    AWAITING_GUEST_COUNT = "awaiting_guest_count",
    AWAITING_PAYMENT = "awaiting_payment",

    READY_TO_BOOK = "ready_to_book",
    BOOKING_PENDING = "booking_pending",
    BOOKING = "booking",
    BOOKING_CONFIRMED = "booking_confirmed",
    BOOKING_REJECTED = "booking_rejected",
    BOOKING_FAILED = "booking_failed",// SERVER ERROR,OR AN ERROR OCCURRED
    COMPLETED = "completed",

    CANCELLED = "cancelled",
}