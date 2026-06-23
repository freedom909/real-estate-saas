
import { injectable } from "tsyringe";

import {
    AgentAction,
    EntityType,
    SemanticContext
} from "../semantic-context";

import { AIDomain }
    from "../types/ai.domain";

const UUID_REGEX =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

@injectable()
export class MessageRuleExtractor {

extract(message: string): SemanticContext | null {

    console.log(
      "🔥 MessageRuleExtractor called"
    );

    console.log(
      "MESSAGE =",
      message
    );

    const lower =
      message.toLowerCase();

        const bookingId =
            message.match(UUID_REGEX)?.[0];

        // ----------------------------------
        // GET MY BOOKINGS
        // ----------------------------------

        if (
            lower.includes("show my bookings") ||
            lower.includes("my bookings")
        ) {
            return new SemanticContext(
                message,
                [],
                {
                    type: AgentAction.GET_MY_BOOKINGS,
                    confidence: 0.99
                },
                0.99,
                AIDomain.BOOKING,
                false
            );
        }

        // ----------------------------------
        // GET BOOKING
        // ----------------------------------

        if (
            (
                lower.includes("show booking") ||
                lower.includes("get booking")
            ) &&
            bookingId
        ) {
            return this.buildBookingIntent(
                message,
                AgentAction.GET_BOOKING,
                bookingId
            );
        }

        // ----------------------------------
        // CONFIRM BOOKING
        // ----------------------------------

        if (
            lower.includes("confirm booking") &&
            bookingId
        ) {
            return this.buildBookingIntent(
                message,
                AgentAction.CONFIRM_BOOKING,
                bookingId
            );
        }

        // ----------------------------------
        // CANCEL BOOKING
        // ----------------------------------

        if (
            lower.includes("cancel booking") &&
            bookingId
        ) {
            return this.buildBookingIntent(
                message,
                AgentAction.CANCEL_BOOKING,
                bookingId
            );
        }

        // ----------------------------------
        // COMPLETE BOOKING
        // ----------------------------------

        if (
            lower.includes("complete booking") &&
            bookingId
        ) {
            return this.buildBookingIntent(
                message,
                AgentAction.COMPLETE_BOOKING,
                bookingId
            );
        }

        return null;
    }

    private buildBookingIntent(
        message: string,
        action: AgentAction,
        bookingId: string
    ): SemanticContext {

        return new SemanticContext(
            message,
            [
                {
                    type: EntityType.BOOKING_ID,
                    value: bookingId
                }
            ],
            {
                type: action,
                confidence: 0.99
            },
            0.99,
            AIDomain.BOOKING,
            false
        );
    }
}