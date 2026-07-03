// src/wisdom/memory/booking-state-updater.ts
//
// BookingStateUpdater — thin orchestrator for booking state flow.
//
// Architecture (Redux / Event Sourcing inspired):
//
//   Artifact
//       ↓  ArtifactTransitionMapper.map()
//   BookingTransitionEvent | null
//       ↓  bookingReducer(state, event)
//   BookingMemory (new state)
//       ↓  SessionStore.save()
//   Persisted
//
// This class has NO logic of its own. It wires three pure layers:
//   1. ArtifactTransitionMapper — maps artifact types → domain events
//   2. bookingReducer           — computes next state (pure function)
//   3. MemorySessionStore       — loads and saves session data
//
// ────────────────────────────────────────────────────────────────

import { inject, injectable } from "tsyringe";

import { MemoryContext } from "./type/memory-context";
import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";
import { MemorySessionStore } from "./session/session-memory.store";

import { BookingState } from "@/core/booking/domain/state/booking-state";
import { bookingReducer } from "@/core/booking/domain/state/booking-reducer";
import { ArtifactTransitionMapper, Artifact } from "./booking/artifact-transition-mapper";
import { SessionMemory } from "./type/sessionMemory";

@injectable()
export class BookingStateUpdater {
  constructor(
    @inject(WISDOM_TOKENS.memory.sessionStore)
    private readonly sessionStore: MemorySessionStore,

    private readonly mapper = new ArtifactTransitionMapper(),
  ) {}

  /**
   * Process one artifact through the booking state pipeline:
   *   artifact → event → reduce → save
   */
  apply(ctx: MemoryContext, artifact: Artifact): void {
    // ── 1. Load current session ──
    const session = this.sessionStore.load(ctx);
    if (!session.booking) {
      session.booking = { status: BookingState.AWAITING_LISTING };
    }

    // ── 2. Side-effect: cache search results in session ──
    if (artifact.type === "LISTING_SEARCH_RESULT") {
      session.searchResults = artifact.content.listings ?? [];
    }

    // ── 3. Map artifact → domain event ──
    const event = this.mapper.map(artifact);
    if (!event) {
      return; // artifact doesn't affect booking state
    }

    // ── 4. Reduce: compute new booking state ──
    session.booking = bookingReducer(session.booking, event);

    // ── 5. Persist ──
    this.sessionStore.save(ctx, session as SessionMemory);
  }
}
