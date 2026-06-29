// session memory store

// src/wisdom/memory/session-memory.store.ts

import { injectable } from "tsyringe";
import { SessionMemoryState } from "../type/session-memory.state";
import { MemoryContext } from "../type/memory-context";

@injectable()
export class MemorySessionStore {
        constructor() {
        console.log(
            "MemorySessionStore created",
            this
        );
    }
    private readonly store = new Map<string, SessionMemoryState>();

    load(ctx: MemoryContext): SessionMemoryState {
        console.log("LOAD sessionId:", ctx.sessionId);
        console.log("STORE:", this.store);

        const session = this.store.get(ctx.sessionId);

        console.log("SESSION:", session);

        return session ?? {};
    }

save(ctx: MemoryContext, session: SessionMemoryState): void {
    console.log("====== SAVE ENTER ======");
    console.log("INSTANCE", this);
    console.log("SESSION ID", ctx.sessionId);

    this.store.set(ctx.sessionId, session);

    console.log("STORE AFTER");
    console.log(this.store);
}
}