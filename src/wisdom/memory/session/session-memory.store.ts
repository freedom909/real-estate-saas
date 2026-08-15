// src/wisdom/memory/session/session-memory.store.ts

import { ConversationFocus, ConversationState } from "@/wisdom/conversation/context/conversation-state";
import { injectable } from "tsyringe";
import { SessionMemory } from "../type/sessionMemory";


@injectable()
export class MemorySessionStore {

  private readonly sessions =
    new Map<string, SessionMemory>();

  get(
    sessionId: string,
  ): SessionMemory | undefined {

    return this.sessions.get(sessionId);
  }

  getOrCreate(
    sessionId: string,
  ): SessionMemory {

    let state =
      this.sessions.get(sessionId);

    if (!state) {

      state = {
        sessionId,
        currentFocus: undefined,
        bookingDraft: undefined,
        recentEntities: [],

        updatedAt: Date.now(),
      };

      this.sessions.set(
        sessionId,
        state,
      );
    }

    return state;
  }

  set(
    sessionId: string,
    state: SessionMemory,
  ): void {

    state.updatedAt = Date.now();

    this.sessions.set(
      sessionId, state,
    );
  }

  setFocus(
    sessionId: string,
    focus: SessionMemory["currentFocus"],
  ): void {

    const state =
      this.getOrCreate(sessionId);

    state.currentFocus = focus;

    state.recentEntities.unshift(
      focus,
    );

    state.recentEntities =
      state.recentEntities.slice(0, 20);

    state.updatedAt = Date.now();

    this.sessions.set(
      sessionId,
      state,
    );
  }

  clear(
    sessionId: string,
  ): void {

    this.sessions.delete(
      sessionId,
    );
  }
}