//src/modules/tokens/booking.tokens.ts
export const TOKENS_BOOKING = {
  gateway: {
    bookingGateway: Symbol.for("BookingGateway"),
  },
  usecase: {
    confirmBookingUseCase: Symbol.for("ConfirmBookingUseCase"),
    cancelBookingUseCase: Symbol.for("CancelBookingUseCase"),
  },
  repository: {
    bookingRepository: Symbol.for("BookingRepository"),
  },
  eventBus: {
    eventBus: Symbol.for("EventBus"),
  },
}