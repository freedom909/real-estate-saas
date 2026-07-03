// src/wisdom/memory/booking/artifact-transition-mapper.ts
//
// ArtifactTransitionMapper
//
// Maps Wisdom layer artifacts → Booking domain transition events.
// Pure function — no side effects, no DI dependencies.
//
// This is the single place where we decide how each artifact type
// translates into a booking domain event. Adding a new artifact type
// means adding a single case here.
//
// ────────────────────────────────────────────────────────────────

import {
  BookingEvent,
  BookingTransitionEvent,
} from "@/core/booking/domain/state/booking-event";

export interface Artifact {
  type: string;
  content: any;
}

export class ArtifactTransitionMapper {

  /**
   * Convert a Wisdom artifact into a booking domain event.
   * Returns null if the artifact doesn't map to any booking event
   * (e.g., LISTING_OPTIMIZATION, GENERAL_RESPONSE).
   */
  map(artifact: Artifact): BookingTransitionEvent | null {
    switch (artifact.type) {
      // case "LISTING_SEARCH_RESULT":
      //   return {
      //     type: BookingEvent.SELECT_LISTING,
      //     payload: artifact.content.listings?.[0],
      //   };

      case "LISTING_SELECTED":
        return {
          type: BookingEvent.SELECT_LISTING,
          payload: artifact.content,
        };

      case "DATES_SELECTED":
        return {
          type: BookingEvent.SET_DATES,
          payload: artifact.content,
        };

      case "GUEST_COUNT_SELECTED":
        return {
          type: BookingEvent.SET_GUEST_COUNT,
          payload: artifact.content,
        };

      case "CONTACT_SET":
        return {
          type: BookingEvent.SET_CONTACT,
          payload: artifact.content,
        };

      case "SPECIAL_REQUEST_SET":
        return {
          type: BookingEvent.SET_SPECIAL_REQUESTS,
          payload: artifact.content,
        };

      case "BOOKING_CREATED":
        return {
          type: BookingEvent.CONFIRM,
          payload: artifact.content,
        };

      case "BOOKING_CANCELLED":
        return {
          type: BookingEvent.CANCEL,
        };

      default:
        return null;
    }
  }
}
