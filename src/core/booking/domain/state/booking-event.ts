// src/core/booking/domain/state/booking-event.ts

export enum BookingEventType {
  SELECT_LISTING = "SELECT_LISTING",
  SET_DATES = "SET_DATES",
  SET_GUESTS = "SET_GUESTS",
  CONFIRM = "CONFIRM",
  FAIL = "FAIL",
  CANCEL = "CANCEL",
  RESET = "RESET",
}

export interface BookingEvent {
  type: BookingEventType;
  payload?: any;
}