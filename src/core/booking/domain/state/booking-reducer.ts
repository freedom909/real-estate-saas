// src/core/booking/domain/state/booking-reducer.ts
//
// BookingReducer — pure state transition function.
//
// Given a current BookingMemory state and a BookingTransitionEvent,
// returns a NEW state without mutating the input.
//
// This is the single source of truth for how booking state evolves.
// No side effects, no DI dependencies, no external calls.
//
// ────────────────────────────────────────────────────────────────

import { BookingMemory } from "@/wisdom/memory/type/booking.memory";
import {
  BookingEvent,
  BookingTransitionEvent,
} from "./booking-event";
import { BookingState } from "./booking-state";

/**
 * Pure reducer: (currentState, event) → nextState.
 *
 * Immutable — returns a new object, never mutates the input.
 * All transition guards live here (e.g., can't set dates without a listing).
 */
export function bookingReducer(
  state: BookingMemory,
  event: BookingTransitionEvent,
): BookingMemory {
  switch (event.type) {

    // ── Select listing ──────────────────────────────────────
    case BookingEvent.SELECT_LISTING: {
      if (!event.payload?.id) {
        return state; // guard: no valid listing selected
      }
      return {
        ...state,
        listingId: event.payload.id,
        listingTitle: event.payload.title,
        status: BookingState.AWAITING_DATES,
      };
    }

    // ── Set check-in / check-out dates ──────────────────────
    case BookingEvent.SET_DATES: {
      if (!event.payload) {
        return state;
      }
      return {
        ...state,
        checkInDate: event.payload.startDate,
        checkOutDate: event.payload.endDate,
        status: BookingState.AWAITING_GUEST_COUNT,
      };
    }

    // ── Set guest count ─────────────────────────────────────
    case BookingEvent.SET_GUEST_COUNT: {
      if (!event.payload) {
        return state;
      }
      return {
        ...state,
        guestCount: event.payload.guestCount,
        status: BookingState.READY_TO_BOOK,
      };
    }

    // ── Confirm / submit booking ────────────────────────────
    case BookingEvent.CONFIRM: {
      if (!state.checkInDate || !state.checkOutDate || !state.guestCount) {
        return state; // guard: missing required fields
      }
      return {
        ...state,
        status: BookingState.BOOKING_PENDING,
      };
    }

    // ── Cancel ──────────────────────────────────────────────
    case BookingEvent.CANCEL: {
      return {
        ...state,
        status: BookingState.CANCELLED,
      };
    }

    // ── Unknown event → no change ───────────────────────────
    default:
      return state;
  }
}
