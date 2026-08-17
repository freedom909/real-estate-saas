export const TOKENS_CALENDAR = {
  models: {
    calendarSlotModel: Symbol.for("CalendarSlotModel"),
  },

  repos: {
    calendarRepository: Symbol.for("CalendarRepository"),
  },

  usecase: {
    reserveSlotUseCase: Symbol.for("ReserveSlotUseCase"),
    releaseSlotUseCase: Symbol.for("ReleaseSlotUseCase"),
    getAvailabilityUseCase: Symbol.for("GetAvailabilityUseCase"),
    blockDatesUseCase: Symbol.for("BlockDatesUseCase"),
    getSlotsByListingUseCase: Symbol.for("GetSlotsByListingUseCase"),
  },

  service: {
    availabilityService: Symbol.for("CalendarAvailabilityService"),
  },
} as const;
