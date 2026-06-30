import { inject, injectable } from "tsyringe";

import { MemoryContext } from "./type/memory-context";
import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";
import { MemorySessionStore } from "./session/session-memory.store";


interface MemoryArtifact {
  type: string;
  content: any;
}
@injectable()
export class BookingStateUpdater {
    constructor(
        @inject(WISDOM_TOKENS.memory.sessionStore)
        private sessionStore: MemorySessionStore,
    ) {
       console.log(
        "BookingStateUpdater sessionStore",
        this.sessionStore
    );         
        
     }
apply(ctx: MemoryContext, artifact: MemoryArtifact) {
console.log("REQUEST SESSION", ctx.sessionId);//

const session = this.sessionStore.load(ctx);//型 'string' の引数を型 'MemoryContext' のパラメーターに割り当てることはできません。

console.log(session);   
    switch (artifact.type) {

        case "LISTING_SEARCH_RESULT":
            session.searchResults = artifact.content.listings ?? [];
            break;

        case "BOOKING":
            session.booking = {
                ...session.booking,
                ...artifact.content,
            };
            break;
    }

    this.sessionStore.save(ctx, session);
    console.log("SAVE:", session);
}
}