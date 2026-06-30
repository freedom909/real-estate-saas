// src/wisdom/memory/booking-state-updater.ts

import { inject, injectable } from "tsyringe";

import { MemoryContext } from "./type/memory-context";
import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";
import { MemorySessionStore } from "./session/session-memory.store";

import { BookingState } from "@/core/booking/domain/state/booking-state";
import { BookingStateMachine } from "@/core/booking/domain/state/booking-state-machine";
import {
  BookingEvent,
  BookingTransitionEvent,
} from "@/core/booking/domain/state/booking-event";
import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";

interface MemoryArtifact {
  type: string;
  content: any;
}

@injectable()
export class BookingStateUpdater {
  constructor(
    @inject(WISDOM_TOKENS.memory.sessionStore)
    private readonly sessionStore: MemorySessionStore,

    @inject(TOKENS_BOOKING.state.bookingStateMachine)
    private readonly bookingStateMachine: BookingStateMachine,
  ) {}

  apply(ctx: MemoryContext, artifact: MemoryArtifact): void {
    const session = this.sessionStore.load(ctx);

    if (!session.booking) {
      session.booking = {
        status: BookingState.AWAITING_LISTING,
      };
    }

    // Session memory belongs here, not inside the state machine.
    if (artifact.type === "LISTING_SEARCH_RESULT") {
      session.searchResults = artifact.content.listings ?? [];
    }

    const transitionEvent = this.toTransitionEvent(artifact);

    if (!transitionEvent) {
      return;
    }

    session.booking = this.bookingStateMachine.transition(
      session.booking,
      transitionEvent,
    );

    this.sessionStore.save(ctx, session);
  }

  /**
   * Convert Wisdom artifacts into Booking domain events.
   */
  private toTransitionEvent(
    artifact: MemoryArtifact,
  ): BookingTransitionEvent | null {
    switch (artifact.type) {
      case "LISTING_SEARCH_RESULT":
        return {
          type: BookingEvent.SELECT_LISTING,
          payload: artifact.content.listings?.[0],
        };

      case "SET_DATES":
        return {
          type: BookingEvent.SET_DATES,
          payload: {
            checkInDate: artifact.content.checkInDate,
            checkOutDate: artifact.content.checkOutDate,
          },
        };

      case "SET_GUEST_COUNT":
        return {
          type: BookingEvent.SET_GUEST_COUNT,
          payload: {
            guestCount: artifact.content.guestCount,
          },
        };

      case "SET_CONTACT":
        return {
          type: BookingEvent.SET_CONTACT,
          payload: {
            contactName: artifact.content.contactName,
          },
        };

      case "SET_SPECIAL_REQUESTS":
        return {
          type: BookingEvent.SET_SPECIAL_REQUESTS,
          payload: {
            specialRequests: artifact.content.specialRequests,
          },
        };

      case "BOOKING":
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