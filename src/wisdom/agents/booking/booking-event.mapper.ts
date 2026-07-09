// BookingEventMapper.ts

// wisdom/booking/booking-event.mapper.ts

import { injectable } from "tsyringe";
import { SemanticContext } from "../../semantic/semantic-context";
import { BookingEvent } from "@/core/booking/domain/state/booking-event";
import { BookingState } from "@/core/booking/domain/state/booking-state";
import { BookingMemory } from "@/wisdom/memory/type/booking.memory";
import { EntityType } from "@/wisdom/shared/enums/entity-type.enum";
import { AgentAction } from "@/wisdom/shared/enums/action.enum";

@injectable()
export class BookingEventMapper {
    fromSemantic(
        semantic: SemanticContext,
        booking: BookingMemory,
    ): BookingEvent | null {

        switch (booking.status) {

            case BookingState.AWAITING_LISTING:

                const hasCheckIn =
                    semantic.entities.some(
                        e => e.type === EntityType.CHECK_IN_DATE
                    )
                const hasCheckOut =
                    semantic.entities.some(
                        e => e.type === EntityType.CHECK_OUT_DATE
                    );

                if (hasCheckIn && hasCheckOut) {
                    return BookingEvent.SET_DATES;
                }

                break;

            case BookingState.AWAITING_DATES:

                if (
                    semantic.entities.find(entity => entity.value === AgentAction.CHECK_IN_DATE) &&
                    semantic.entities.find(entity => entity.value === AgentAction.CHECK_OUT_DATE)
                ) {
                    return BookingEvent.SET_DATES;
                }

                break;

            case BookingState.AWAITING_CUSTOMER_COUNT:

                if (semantic.entities.find(entity => entity.value === AgentAction.CUSTOMER_COUNT)) {
                    return BookingEvent.SET_CUSTOMER_COUNT;
                }

                break;

            case BookingState.READY_TO_BOOK:

                if (semantic.action?.type === AgentAction.CONFIRM_BOOKING) {
                    return BookingEvent.CONFIRM;
                }

                break;
        }

        return null;
    }
}