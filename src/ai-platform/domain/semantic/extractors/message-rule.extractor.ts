import { injectable } from "tsyringe";

import {
    AgentAction,
    Entity,
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
                "confirm reservation",
                "confirm booking and reservation"
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

        // Extract ordinal entities from message
        const ordinalEntities =
            this.extractOrdinal(message);

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
        // BOOKING ACTIONS (with UUID)
        // e.g. "cancel booking c3bcab13-..."
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
                    [{ type: EntityType.BOOKING_ID, value: bookingId }]
                );
            }
        }

        // ----------------------------------
        // BOOKING ACTIONS (with ORDINAL, no UUID)
        // e.g. "cancel my latest booking", "confirm the first one"
        // ----------------------------------

        if (ordinalEntities.length > 0) {
            for (const rule of this.bookingRules) {
                if (rule.keywords.some(keyword => lower.includes(keyword))) {
                    console.log(
                        `✅ MATCHED ${rule.action} (ordinal)`
                    );

                    return this.buildBookingIntent(
                        message,
                        rule.action,
                        ordinalEntities
                    );
                }
            }
        }

        return null;
    }

    /**
     * Extract ordinal entities from message text.
     * "first one" → ORDINAL: "first"
     * "second" → ORDINAL: "second"
     * "latest" / "last" → ORDINAL: "latest"
     */
    private extractOrdinal(
        message: string
    ): Entity[] {

        const lower = message.toLowerCase();
        const entities: Entity[] = [];

        if (
            lower.includes("first one") ||
            lower.includes("first listing") ||
            lower.includes("1st one")
        ) {
            entities.push({
                type: EntityType.ORDINAL,
                value: "first"
            });
        } else if (
            lower.includes("second one") ||
            lower.includes("second listing") ||
            lower.includes("2nd one")
        ) {
            entities.push({
                type: EntityType.ORDINAL,
                value: "second"
            });
        } else if (
            lower.includes("third one") ||
            lower.includes("third listing") ||
            lower.includes("3rd one")
        ) {
            entities.push({
                type: EntityType.ORDINAL,
                value: "third"
            });
        } else if (
            lower.includes("latest") ||
            lower.includes("last one") ||
            lower.includes("last booking")
        ) {
            entities.push({
                type: EntityType.ORDINAL,
                value: "latest"
            });
        }

        return entities;
    }

    private buildBookingIntent(
        message: string,
        action: AgentAction,
        entities: Entity[]
    ): SemanticContext {

        return new SemanticContext(
            message,
            entities,
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
