// src/wisdom/memory/booking-state-updater.ts

import { inject, injectable } from "tsyringe";

import { MemoryContext } from "./type/memory-context";

import {
  WISDOM_TOKENS,
} from "../container/tokens/wisdom.tokens";

import {
  MemorySessionStore,
} from "./session/session-memory.store";

import {
  bookingReducer,
} from "@/core/booking/domain/state/booking-reducer";

import {
  ArtifactTransitionMapper,
  Artifact,
} from "./booking/artifact-transition-mapper";

import {
  SessionMemory,
} from "./type/sessionMemory";

import {
  EntityType,
} from "../semantic/semantic-context";

import {
  BookingTransitionEvent,
} from "@/core/booking/domain/state/booking-event";


@injectable()
export class BookingStateUpdater {

  constructor(

    @inject(WISDOM_TOKENS.memory.sessionStore)
    private readonly sessionStore: MemorySessionStore,

    private readonly mapper =
      new ArtifactTransitionMapper(),

  ) {}

  apply(
    ctx: MemoryContext,
    artifact: Artifact,
  ): void {

    // ─────────────────────────────
    // 1. Load session
    // ─────────────────────────────

    let session =
      this.sessionStore.get(
        ctx.sessionId,
      );

    if (!session) {

      session = {
        sessionId: ctx.sessionId,

        currentFocus: undefined,

        recentEntities: [],

        searchResults: [],

        bookingDraft: undefined,

        updatedAt: Date.now(),
      };
    }

    // ─────────────────────────────
    // 2. Artifact → Domain Event
    // ─────────────────────────────

    const event =
      this.mapper.map(artifact);

    // ─────────────────────────────
    // 3. Search result memory
    // ─────────────────────────────

    if (
      artifact.type ===
      "LISTING_SEARCH_RESULT"
    ) {

      session.searchResults =
        artifact.content.listings ?? [];

      session.recentEntities =
        session.searchResults;

    }

    // ─────────────────────────────
    // 4. Booking memory reducer
    // ─────────────────────────────

    if (event) {

      session.bookingDraft =
        bookingReducer(
          session.bookingDraft,
          event as BookingTransitionEvent,
        );
    }

    // ─────────────────────────────
    // 5. Conversation focus
    // ─────────────────────────────

    this.updateFocus(
      session,
      artifact,
    );

    // ─────────────────────────────
    // 6. Persist
    // ─────────────────────────────

    session.updatedAt =
      Date.now();

    this.sessionStore.set(
      ctx.sessionId,
      session,
    );
  }


  private updateFocus(
    session: SessionMemory,
    artifact: Artifact,
  ): void {

    const content =
      artifact.content;

    switch (artifact.type) {

      // ─────────────────────────
      // Listing
      // ─────────────────────────

      case "LISTING_SELECTED":
      case "LISTING_SEARCH_RESULT": {

        const listingId =
          content.listingId ??
          content.id;

        if (!listingId) {
          return;
        }

        session.currentFocus = {

          entityType:
            EntityType.LISTING,

          entityId:
            listingId,

          source:
            artifact.type,

          timestamp:
            Date.now(),
        };

        break;
      }


      // ─────────────────────────
      // Booking
      // ─────────────────────────

      case "BOOKING_CREATED":
      case "BOOKING_GET":
      case "BOOKING_CONFIRMED":
      case "BOOKING_COMPLETED":
      case "BOOKING_CANCELLED": {

        const bookingId =
          content.id ??
          content.bookingId;

        if (!bookingId) {
          return;
        }

        session.currentFocus = {

          entityType:
            EntityType.BOOKING,

          entityId:
            bookingId,

          source:
            artifact.type,

          timestamp:
            Date.now(),
        };

        break;
      }

      default:
        break;
    }
  }
}