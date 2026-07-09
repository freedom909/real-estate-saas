//src/modules/tokens/booking.tokens.ts
export const TOKENS_BOOKING = {
  gateway: {
    bookingGateway: Symbol.for("BookingGateway"),
  },

  acl: {
    bookingACL: Symbol.for("BookingACL"),
  },
  state: {
    bookingStateMachine: Symbol.for("BookingStateMachine"),
  },

  usecase: {
    confirmBookingUseCase: Symbol.for("ConfirmBookingUseCase"),
    cancelBookingUseCase: Symbol.for("CancelBookingUseCase"),
    getBookingUseCase: Symbol.for("GetBookingUseCase"),
    createBookingUseCase: Symbol.for("CreateBookingUseCase"),
    completeBookingUseCase: Symbol.for("CompleteBookingUseCase"),
    getBookingsForCustomerUseCase: Symbol.for("GetBookingsForCustomerUseCase"),
  },
  repository: {
    bookingRepository: Symbol.for("BookingRepository"),
    cancelBookingRepository: Symbol.for("CancelBookingRepository"),
  },
  eventBus: {
    eventBus: Symbol.for("EventBus"),
  },
}
