// src/core/booking/domain/state/booking-state-machine.ts

import { BookingMemory } from "@/wisdom/memory/type/booking.memory";
import { BookingEvent } from "./booking-event";
import { BookingState } from "./booking-state";

export interface BookingTransitionEvent {
  type: BookingEvent;
  payload?: any;
}

export class BookingStateMachine {

  transition(booking: BookingMemory, event: BookingTransitionEvent): BookingMemory {

    switch (event.type) {
      case BookingEvent.SELECT_LISTING:
        booking.listingId = event.payload.id;
        booking.listingTitle =event.payload.title;
        booking.status = BookingState.AWAITING_DATES;
        return booking;

      case BookingEvent.SET_DATES:
        booking.checkInDate =event.payload.startDate;
        booking.checkOutDate =event.payload.endDate;
        booking.status =BookingState.AWAITING_GUEST_COUNT;
        return booking;

      case BookingEvent.SET_GUEST_COUNT:
        booking.guestCount = event.payload.guestCount;       
        booking.status = BookingState.READY_TO_BOOK;
        return booking;
    
    case BookingEvent.CONFIRM:
          if (
        booking.checkInDate &&
        booking.checkOutDate &&
        booking.guestCount
    ) {
        booking.status = BookingState.BOOKING_PENDING;
      return booking;
    }

    case BookingEvent.CANCEL:
      booking.status = BookingState.CANCELLED;
      return booking;
    default:
      return booking;
    }
  }
}