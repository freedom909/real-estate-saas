// session memory store

// src/wisdom/memory/session-memory.store.ts

import { injectable } from "tsyringe";
import { SessionMemoryState } from "../type/session-memory.state";
import { ListingSummary, MemoryContext } from "../type/memory-context";
import { SessionMemory } from "../type/sessionMemory";

@injectable()
export class MemorySessionStore {
    private readonly instanceId = Math.random().toString(36);
        constructor() {
        console.log(
            "MemorySessionStore created",
            this.instanceId
        );
    }
    private readonly store = new Map<string, SessionMemoryState>();

load(ctx: MemoryContext): SessionMemoryState {
    console.log("INSTANCE", this.instanceId);
    console.log("CTX SESSION", ctx.sessionId);
    console.log("STORE KEYS", [...this.store.keys()]);

    const session = this.store.get(ctx.sessionId);
    ctx.session = session;
    console.log("FOUND SESSION", session);

    return session ?? {};
}


 save(ctx: MemoryContext, session: SessionMemory): void {
        this.store.set(ctx.sessionId, session);
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