//src/modules/tokens/booking.tokens.ts
export const TOKENS_BOOKING = {
  gateway: {
    bookingGateway: Symbol.for("BookingGateway"),
  },
  usecase: {
    confirmBooking: Symbol.for("ConfirmBookingUseCase"),
  },
  repository: {
    bookingRepository: Symbol.for("BookingRepository"),
  },
  eventBus: {
    eventBus: Symbol.for("EventBus"),
  },
}