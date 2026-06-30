// src/core/booking/domain/state/booking-state-machine.ts

import { BookingEventType } from "./booking-event";
import { BookingState } from "./booking-state";

export class BookingStateMachine {
    transition: any;

    next(state: BookingState, event: any) : BookingState {
        switch (state) {
        case BookingState.IDLE:
        if (event.type === BookingEventType.SELECT_LISTING) {
          return BookingState.AWAITING_DATES;
        }
        return state;
       case BookingState.AWAITING_LISTING:
        if (event.type === BookingEventType.SELECT_LISTING) {
          return BookingState.AWAITING_DATES;
        }
        return state;

      case BookingState.AWAITING_DATES:
        if (event.type === BookingEventType.SET_DATES) {
          return BookingState.AWAITING_GUEST_COUNT;
        }
        return state;

      case BookingState.AWAITING_GUEST_COUNT:
        if (event.type === BookingEventType.SET_GUESTS) {
          return BookingState.READY_TO_BOOK;
        }
        return state;

      case BookingState.READY_TO_BOOK:
        if (event.type === BookingEventType.CONFIRM) {
          return BookingState.BOOKING_PENDING;
        }
        return state;

      case BookingState.BOOKING_PENDING:
        if (event.type === BookingEventType.CONFIRM) {
          return BookingState.BOOKING;
        }
        if (event.type === BookingEventType.FAIL) {
          return BookingState.BOOKING_FAILED;
        }
        return state;

      case BookingState.BOOKING:
        if (event.type === BookingEventType.CONFIRM) {
          return BookingState.BOOKING_CONFIRMED;
        }
        if (event.type === BookingEventType.FAIL) {
          return BookingState.BOOKING_FAILED;
        }
        return state;

      case BookingState.BOOKING_FAILED:
        if (event.type === BookingEventType.RESET) {
          return BookingState.IDLE;
        }
        return state;

      case BookingState.BOOKING_CONFIRMED:
        if (event.type === BookingEventType.RESET) {
          return BookingState.IDLE;
        }
        return state;

      case BookingState.CANCELLED:
        if (event.type === BookingEventType.RESET) {
          return BookingState.IDLE;
        }
        return state;

      default:
        return state;
    }
  }

}