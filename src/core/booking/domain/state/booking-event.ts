// src/core/booking/domain/state/booking-event.ts

export enum BookingEvent {
  SELECT_LISTING = "SELECT_LISTING",
  SET_DATES = "SET_DATES",
  SET_CUSTOMER_COUNT = "SET_CUSTOMER_COUNT",
  CONFIRM = "CONFIRM",
  FAIL = "FAIL",
  CANCEL = "CANCEL",
  RESET = "RESET",
  SET_SPECIAL_REQUESTS = "SET_SPECIAL_REQUESTS",
  SET_CONTACT = "SET_CONTACT",
}

// ── Payload types for each event ─────────────────────────────

export interface SelectListingPayload {
  id: string;
  title?: string;
  [key: string]: unknown;
}

export interface SetDatesPayload {
  startDate: string;
  endDate: string;
  [key: string]: unknown;
}

export interface SetCustomerCountPayload {
  customerCount: number;
  [key: string]: unknown;
}

export interface SetContactPayload {
  contactName: string;
  [key: string]: unknown;
}

export interface SetSpecialRequestsPayload {
  specialRequests: string;
  [key: string]: unknown;
}

// ── Discriminated union ──────────────────────────────────────

export type BookingTransitionEvent =
  | { type: BookingEvent.SELECT_LISTING; payload?: SelectListingPayload }
  | { type: BookingEvent.SET_DATES;      payload?: SetDatesPayload }
  | { type: BookingEvent.SET_CUSTOMER_COUNT; payload?: SetCustomerCountPayload }
  | { type: BookingEvent.SET_CONTACT;    payload?: SetContactPayload }
  | { type: BookingEvent.SET_SPECIAL_REQUESTS; payload?: SetSpecialRequestsPayload }
  | { type: BookingEvent.CONFIRM;        payload?: Record<string, unknown> }
  | { type: BookingEvent.FAIL;           payload?: Record<string, unknown> }
  | { type: BookingEvent.CANCEL }
  | { type: BookingEvent.RESET };
