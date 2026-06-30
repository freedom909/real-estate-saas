// src/core/booking/domain/state/booking-event.ts

export enum BookingEvent {
  SELECT_LISTING = "SELECT_LISTING",
  SET_DATES = "SET_DATES",
  SET_GUEST_COUNT = "SET_GUEST_COUNT",
  CONFIRM = "CONFIRM",
  FAIL = "FAIL",
  CANCEL = "CANCEL",
  RESET = "RESET",
  SET_SPECIAL_REQUESTS = "SET_SPECIAL_REQUESTS",
  SET_CONTACT = "SET_CONTACT",
}

export interface BookingTransitionEvent {
  type: BookingEvent;
  payload?: unknown;
}