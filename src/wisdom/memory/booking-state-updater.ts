import { inject, injectable } from "tsyringe";

import { MemoryContext } from "./type/memory-context";
import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";
import { MemorySessionStore } from "./session/session-memory.store";

import { BookingStateMachine } from "@/core/booking/domain/state/booking-state-machine";
import { BookingState } from "@/core/booking/domain/state/booking-state";
import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";

interface MemoryArtifact {
    type: string;
    content: any;
}

@injectable()
export class BookingStateUpdater {
    constructor(
        @inject(WISDOM_TOKENS.memory.sessionStore)
        private sessionStore: MemorySessionStore,

        @inject(TOKENS_BOOKING.state.bookingStateMachine)
        private bookingStateMachine: BookingStateMachine,
    ) { }

    apply(ctx: MemoryContext, artifact: MemoryArtifact) {

        console.log("REQUEST SESSION", ctx.sessionId);

        const session = this.sessionStore.load(ctx);

        if (!session.booking) {
            session.booking = {
                status: BookingState.AWAITING_LISTING,
            };
        }
        console.log("=== APPLY START ===");
        switch (artifact.type) {
case "LISTING_SEARCH_RESULT": {

    const listing =
        artifact.content.listings?.[0];

    // 保存搜索结果
    session.searchResults =
        artifact.content.listings ?? [];

    // 保存 booking 状态
    session.booking = {
        ...session.booking,
        listingId: listing?.id,
        listingTitle: listing?.title,
    };

    session.booking.status =
        this.bookingStateMachine.next(
            session.booking.status ?? BookingState.IDLE,
            { type: "SELECT_LISTING" }
        );

    break;
}

            case "BOOKING": {
                const currentState = session.booking.status ?? BookingState.IDLE;// 型 'string' の引数を型 'BookingState' のパラメーターに割り当てることはできません。
                session.booking.status = this.bookingStateMachine.next(
                    currentState as BookingState,
                    {
                        type: artifact.content.type ?? "CONFIRM",
                        payload: artifact.content,
                    }
                );

                session.booking = {
                    ...session.booking,
                    ...artifact.content,
                };

                break;
                 }
            }
                console.log("calling save");
                this.sessionStore.save(ctx, session);

                console.log("save finished");
       
    }
}