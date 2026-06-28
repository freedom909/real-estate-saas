// src/wisdom/memory/type/session-memory.store.ts
//
// SessionMemoryStore — manages the session memory state.
//
// This is where we store the user's search results, booking draft, and booking memory.
//
// ────────────────────────────────────────────────────────────────
import { SessionMemoryState } from "./session-memory.state";

import { injectable } from "tsyringe";

import { MemoryContext } from "../type/memory-context";


@injectable()
export class SessionMemoryStore {

    private readonly store = new Map<string, SessionMemoryState>();

    load(ctx: MemoryContext): SessionMemoryState {
        console.log("ctx", this.store.get(ctx.sessionId));
        return (
            this.store.get(ctx.sessionId)
            ?? {}
        );
    }

    save(
        ctx: MemoryContext,
        memory: SessionMemoryState
    ): void {

        this.store.set(
            ctx.sessionId,
            memory
        );

    }

    clear(
        ctx: MemoryContext
    ): void {

        this.store.delete(
            ctx.sessionId
        );
    }

    has(
        ctx: MemoryContext
    ): boolean {

        return this.store.has(
            ctx.sessionId
        );

    }

}