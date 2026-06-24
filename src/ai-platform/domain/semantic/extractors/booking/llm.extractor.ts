// src/ai-platform/domain/semantic/extractors/booking/llm.extractor.ts

import { inject, injectable } from "tsyringe";

import {
    SemanticContext,
    Entity,
    EntityType,
    AgentAction,
} from "../../semantic-context";

import { OpenAIAdapter } from "@/ai-platform/infrastructure/adapters/openai.adapter";
import { AIDomain } from "../../types/ai.domain";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { SemanticSchema } from "@/ai-platform/schemas/semantic.schema";

@injectable()
export default class LLMExtractor {

    constructor(
        @inject(TOKENS_AI.OpenAIAdapter)
        private ai: OpenAIAdapter
    ) { }

    async extract(message: string): Promise<SemanticContext> {

        // ======================================
        // 1. Prompt
        // ======================================
        const prompt = `
You are a high-precision AI booking intent extractor.

User message:
"${message}"

Return ONLY valid JSON.

Available domain:
BOOKING

Available primaryAction:
- SEARCH_LISTING (user wants to find/list/search rooms or listings)
- CHECK_AVAILABILITY (user wants to know if a listing is available for dates)
- CREATE_BOOKING (user wants to book a room)
- CANCEL_BOOKING (user wants to cancel a booking)
- CONFIRM_BOOKING (user wants to confirm a pending booking)
- COMPLETE_BOOKING (user wants to mark a booking as completed)
- MODIFY_BOOKING (user wants to change dates, guests, or other booking details)
- GET_BOOKING (user wants to view a specific booking)
- GET_MY_BOOKINGS (user wants to list their bookings)

Rules:
- primaryAction is REQUIRED
- entities must always be an array
- NEVER return entities as object
- ALWAYS return SEARCH_LISTING for general booking requests like "help me book a room"
- ALWAYS return SEARCH_LISTING for "show me rooms in [location]", "find a room in [location]"
- ALWAYS return CHECK_AVAILABILITY for "is there availability", "is it available"
- Extract LOCATION entity when user mentions a place
- Extract DATE_RANGE entity when user mentions dates
- Extract GUEST_COUNT entity when user mentions number of guests
- Extract LISTING_ID entity when user references a specific listing
- Extract BOOKING_ID entity when user references a specific booking
- Extract ORDINAL entity when user says "first", "second", "third", "last", "latest"

Output format:
{
  "domain":"BOOKING",
  "primaryAction":"SEARCH_LISTING",
  "confidence":0.95,
  "entities":[]
}

Examples:

User: "show me rooms in Kyoto"
=> {"domain":"BOOKING","primaryAction":"SEARCH_LISTING","confidence":0.95,"entities":[{"type":"LOCATION","value":"Kyoto"}]}

User: "find a room in Osaka next week"
=> {"domain":"BOOKING","primaryAction":"SEARCH_LISTING","confidence":0.95,"entities":[{"type":"LOCATION","value":"Osaka"},{"type":"DATE_RANGE","value":"next week"}]}

User: "is there availability tomorrow"
=> {"domain":"BOOKING","primaryAction":"CHECK_AVAILABILITY","confidence":0.9,"entities":[{"type":"DATE_RANGE","value":"tomorrow"}]}

User: "book room 123"
=> {"domain":"BOOKING","primaryAction":"CREATE_BOOKING","confidence":0.95,"entities":[{"type":"LISTING_ID","value":"123"}]}

User: "cancel my booking abc-456"
=> {"domain":"BOOKING","primaryAction":"CANCEL_BOOKING","confidence":0.95,"entities":[{"type":"BOOKING_ID","value":"abc-456"}]}

User: "change my check-in to June 25"
=> {"domain":"BOOKING","primaryAction":"MODIFY_BOOKING","confidence":0.9,"entities":[{"type":"CHECK_IN","value":"June 25"}]}

User: "show my bookings"
=> {"domain":"BOOKING","primaryAction":"GET_MY_BOOKINGS","confidence":0.95,"entities":[]}
`;

        // ======================================
        // 2. LLM Call
        // ======================================
        const response = await this.ai.generateText({ prompt });

        const raw =
            typeof response === "string"
                ? response
                : JSON.stringify(response);

        const cleaned = raw
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        let parsed: any;

        try {
            parsed = JSON.parse(cleaned);
        } catch (e) {
            throw new Error("Invalid JSON from LLM");
        }

        // ======================================
        // 3. Normalize & Resolve
        // ======================================
        parsed = this.normalizeResponse(parsed, message);

        // Message-level override
        parsed.primaryAction =
            this.resolveActionFromMessage(message, parsed.primaryAction);

        // Entity-level override
        parsed.primaryAction =
            this.resolveActionFromEntities(parsed.primaryAction, parsed.entities ?? []);

        parsed.actions = [parsed.primaryAction];

        console.log("AFTER NORMALIZE >>>", parsed);

        // ======================================
        // 4. Validate via schema
        // ======================================
        const validated = SemanticSchema.parse(parsed);

        // ======================================
        // 5. Build action + entities
        // ======================================
        const action = {
            type: validated.primaryAction as AgentAction,
            confidence: validated.confidence,
        };

        const entities: Entity[] = validated.entities.map((entity) => ({
            type: entity.type as EntityType,
            value: entity.value,
        }));

        // ======================================
        // 6. Build Semantic Context
        // ======================================
        return new SemanticContext(
            message,
            entities,
            action,
            validated.confidence,
            validated.domain as AIDomain,
            false
        );
    }

    // ======================================
    // Normalize LLM response shape
    // ======================================
    private normalizeResponse(parsed: any, message: string) {

        const action = parsed.primaryAction || parsed.action || "GENERAL";
        parsed.primaryAction = action;
        parsed.actions = [action];

        // entities normalization — LLM sometimes returns object instead of array
        if (!Array.isArray(parsed.entities)) {
            parsed.entities = Object.entries(parsed.entities || {}).map(
                ([key, value]) => ({
                    type: key.toUpperCase(),
                    value: String(value)
                })
            );
        }

        if (!parsed.actions) {
            parsed.actions = [];
        }

        if (!parsed.primaryAction) {
            parsed.primaryAction = "SEARCH_LISTING";
        }

        if (!parsed.domain) {
            parsed.domain = "BOOKING";
        }

        return parsed;
    }

    // ======================================
    // Message-Level Action Override
    // ======================================
    private resolveActionFromMessage(
        message: string,
        action: string
    ): string {

        const lower = message.toLowerCase();

        if (lower.includes("confirm booking")) {
            return "CONFIRM_BOOKING";
        }

        // No override — return original action
        return action;
    }

    // ======================================
    // Entity-Based Action Resolution
    // ======================================
    private resolveActionFromEntities(
        llmAction: string,
        entities: { type: string; value: string }[]
    ): string {
        const has = (type: string) =>
            entities.some(e => e.type.toUpperCase() === type.toUpperCase());

        const listingId = has("LISTING_ID");
        const ordinal = has("ORDINAL");
        const bookingId = has("BOOKING_ID");
        const location = has("LOCATION");
        const dateRange = has("DATE_RANGE");

        // Rule 1: CREATE_BOOKING requires listingId or ordinal
        if (llmAction === "CREATE_BOOKING" && !listingId && !ordinal) {
            console.log("🔄 OVERRIDE: CREATE_BOOKING → SEARCH_LISTING (no listingId, no ordinal)");
            return "SEARCH_LISTING";
        }

        // Rule 2: CANCEL/CONFIRM/COMPLETE/MODIFY without bookingId → keep action
        // (BookingAgent will resolve bookingId from context or ordinal)
        if (["CANCEL_BOOKING", "CONFIRM_BOOKING", "COMPLETE_BOOKING", "MODIFY_BOOKING"].includes(llmAction) && !bookingId) {
            console.warn(`⚠️ No bookingId for ${llmAction} — BookingAgent will resolve from context`);
            return llmAction;
        }

        // Rule 3: location + dateRange without listingId → SEARCH_LISTING
        if (location && dateRange && !listingId && !bookingId) {
            if (llmAction !== "SEARCH_LISTING") {
                console.log("🔄 OVERRIDE: location+dateRange → SEARCH_LISTING");
                return "SEARCH_LISTING";
            }
        }

        // Rule 4: location without listingId → SEARCH_LISTING
        if (location && !listingId && !bookingId) {
            if (llmAction === "CREATE_BOOKING" || llmAction === "CHECK_AVAILABILITY") {
                console.log("🔄 OVERRIDE: location only → SEARCH_LISTING");
                return "SEARCH_LISTING";
            }
        }

        // Rule 5: CHECK_AVAILABILITY requires listingId
        if (llmAction === "CHECK_AVAILABILITY" && !listingId) {
            console.log("🔄 OVERRIDE: CHECK_AVAILABILITY → SEARCH_LISTING (no listingId)");
            return "SEARCH_LISTING";
        }

        return llmAction;
    }
}
