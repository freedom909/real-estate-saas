
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
  BOOKING_CREATED = "BOOKING_CREATED",
}

export interface SelectListingPayload {
  listingId: string;
  listingTitle?: string;
  checkInDate?: string;
  checkOutDate?: string;
  customerCount?: number;
}

export interface SetDatesPayload {
  checkInDate: string;
  checkOutDate: string;
}

export interface SetCustomerCountPayload {
  customerCount: number;
}

export interface SetContactPayload {
  contactName: string;
}

export interface SetSpecialRequestsPayload {
  specialRequests: string;
}

export type BookingTransitionEvent =
  | {
      type: BookingEvent.SELECT_LISTING;
      payload: SelectListingPayload;
    }
  | {
      type: BookingEvent.SET_DATES;
      payload: SetDatesPayload;
    }
  | {
      type: BookingEvent.SET_CUSTOMER_COUNT;
      payload: SetCustomerCountPayload;
    }
  | {
      type: BookingEvent.SET_CONTACT;
      payload: SetContactPayload;
    }
  | {
      type: BookingEvent.SET_SPECIAL_REQUESTS;
      payload: SetSpecialRequestsPayload;
    }
  | {
      type: BookingEvent.CONFIRM;
      payload?: Record<string, unknown>;
    }
  | {
      type: BookingEvent.BOOKING_CREATED;
      payload?: Record<string, unknown>;
    }
  | {
      type: BookingEvent.FAIL;
      payload?: Record<string, unknown>;
    }
  | {
      type: BookingEvent.CANCEL;
    }
  | {
      type: BookingEvent.RESET;
    };
