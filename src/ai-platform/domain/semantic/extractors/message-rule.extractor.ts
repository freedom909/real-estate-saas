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

    private readonly bookingRules = [
        {
keywords: [
            "confirm booking",
            "confirm reservation"
        ],
            action: AgentAction.CONFIRM_BOOKING
        },
        {
keywords: [
            "cancel booking",
            "cancel reservation"
        ],
            action: AgentAction.CANCEL_BOOKING
        },
        {
keywords: [
            "complete booking",
            "complete reservation"
        ],
            action: AgentAction.COMPLETE_BOOKING
        },
        {
keywords: [
            "get booking",
            "get reservation"
        ],
            action: AgentAction.GET_BOOKING
        },
        {
keywords: [
            "show booking",
            "show reservation"
        ],
            action: AgentAction.GET_BOOKING
        }
    ];

    extract(
        message: string
    ): SemanticContext | null {

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
                true
            );
        }

        // ----------------------------------
        // BOOKING ACTIONS
        // ----------------------------------

        for (const rule of this.bookingRules) {

            if (
                rule.keywords.some(keyword => lower.includes(keyword)) &&
                bookingId
            ) {

                console.log(
                    `✅ MATCHED ${rule.action}`
                );

                return this.buildBookingIntent(
                    message,
                    rule.action,
                    bookingId
                );
            }
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
            true
        );
    }
}