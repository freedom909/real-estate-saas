
// src/core/booking/domain/state/booking-reducer.ts

import { BookingMemory } from "@/wisdom/memory/type/booking.memory";
import {
  BookingEvent,
  BookingTransitionEvent,
} from "./booking-event";
import { BookingState } from "./booking-state";

export function bookingReducer(
  bookingDraft: BookingMemory | undefined,
  event: BookingTransitionEvent,
): BookingMemory {

  const current: BookingMemory = bookingDraft ?? {
    status: BookingState.IDLE,
  };

  switch (event.type) {

    case BookingEvent.SELECT_LISTING:
  return {
    ...current,

    listingId: event.payload.listingId,
    listingTitle: event.payload.listingTitle,

    checkInDate: event.payload.checkInDate,
    checkOutDate: event.payload.checkOutDate,
    customerCount: event.payload.customerCount,

    status:
      event.payload.checkInDate && event.payload.checkOutDate
        ? event.payload.customerCount
          ? BookingState.READY_TO_BOOK
          : BookingState.AWAITING_CUSTOMER_COUNT
        : BookingState.AWAITING_DATES,
  };


    case BookingEvent.SET_DATES:
      return {
        ...current,
        checkInDate: event.payload.checkInDate,
        checkOutDate: event.payload.checkOutDate,
        status: current.customerCount
          ? BookingState.READY_TO_BOOK
          : BookingState.AWAITING_CUSTOMER_COUNT,
      };

    case BookingEvent.SET_CUSTOMER_COUNT:
      return {
        ...current,
        customerCount: event.payload.customerCount,
        status:
          current.checkInDate && current.checkOutDate
            ? BookingState.READY_TO_BOOK
            : BookingState.AWAITING_DATES,
      };

    case BookingEvent.SET_CONTACT:
      return {
        ...current,
        contactName: event.payload.contactName,
      };

    case BookingEvent.SET_SPECIAL_REQUESTS:
      return {
        ...current,
        specialRequests: event.payload.specialRequests,
      };

    case BookingEvent.CONFIRM:
      return {
        ...current,
        status: BookingState.BOOKING_PENDING,
      };

    case BookingEvent.BOOKING_CREATED:
      return {
        ...current,
        status: BookingState.BOOKING,
      };

    case BookingEvent.FAIL:
      return {
        ...current,
        status: BookingState.BOOKING_FAILED,
      };

    case BookingEvent.CANCEL:
      return {
        ...current,
        status: BookingState.CANCELLED,
      };

    case BookingEvent.RESET:
      return {
        status: BookingState.IDLE,
      };

    default:
      return current;
  }
}
