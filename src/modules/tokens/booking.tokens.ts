//src/modules/tokens/booking.tokens.ts
export const TOKENS_BOOKING = {
  gateway: {
    bookingGateway: Symbol.for("BookingGateway"),
    listingGateway: Symbol.for("ListingGateway"),
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
    updateBookingUseCase: Symbol.for("UpdateBookingUseCase"),
    checkInBookingUseCase: Symbol.for("CheckInBookingUseCase"),
  },
  repository: {
    bookingRepository: Symbol.for("BookingRepository"),
    cancelBookingRepository: Symbol.for("CancelBookingRepository"),
  },
  eventBus: {
    eventBus: Symbol.for("EventBus"),
  },
}
