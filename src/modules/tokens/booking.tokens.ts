//src/modules/tokens/booking.tokens.ts
export const TOKENS_BOOKING = {
  gateway: {
    bookingGateway: Symbol.for("BookingGateway"),
  },

  acl: {
    bookingACL: Symbol.for("BookingACL"),
  },

  usecase: {
    confirmBookingUseCase: Symbol.for("ConfirmBookingUseCase"),
    cancelBookingUseCase: Symbol.for("CancelBookingUseCase"),
    getBookingUseCase: Symbol.for("GetBookingUseCase"),
    createBookingUseCase: Symbol.for("CreateBookingUseCase"),
    completeBookingUseCase: Symbol.for("CompleteBookingUseCase"),
    getBookingsForGuestUseCase: Symbol.for("GetBookingsForGuestUseCase"),
  },
  repository: {
    bookingRepository: Symbol.for("BookingRepository"),
  },
  eventBus: {
    eventBus: Symbol.for("EventBus"),
  },
}
