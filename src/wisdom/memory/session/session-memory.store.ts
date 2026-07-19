// session memory store

// src/wisdom/memory/session-memory.store.ts

import { injectable } from "tsyringe";
import { SessionMemoryState } from "../type/session-memory.state";
import { ListingSummary, MemoryContext } from "../type/memory-context";
import { SessionMemory } from "../type/sessionMemory";

// Module-level store — persists across all instances and DI resolutions
const globalStore = new Map<string, SessionMemoryState>();

@injectable()
export class MemorySessionStore {
    load(ctx: MemoryContext): SessionMemoryState {
        const session = globalStore.get(ctx.sessionId);
        ctx.session = session ?? {};
        return session ?? {};
    }

    save(ctx: MemoryContext, session: SessionMemory): void {
        globalStore.set(ctx.sessionId, session);
    }

    saveSearchResults(
        ctx: MemoryContext,
        listings: ListingSummary[],
    ): void {
        const session = this.load(ctx);
        session.searchResults = listings;
        this.save(ctx, session as SessionMemory);
    }

    getSearchResults(
        ctx: MemoryContext,
    ): ListingSummary[] {
        return this.load(ctx).searchResults ?? [];
    }
}
