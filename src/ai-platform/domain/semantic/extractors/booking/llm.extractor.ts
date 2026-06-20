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
        // 1. Prompt (强约束 + 明确行为空间)
        // ======================================
        const prompt = `
You are a high-precision AI booking intent extractor.

User message:
"${message}"

Return ONLY valid JSON.

Available domain:
BOOKING

Available primaryAction:
- SEARCH_LISTING (user wants to find rooms)
- CREATE_BOOKING
- CANCEL_BOOKING
- CONFIRM_BOOKING
- COMPLETE_BOOKING

Rules:
- primaryAction is REQUIRED
- actions must always be an array
- entities must always be an array
- NEVER return entities as object
- ALWAYS return SEARCH_LISTING for general booking requests like "help me book a room"
- return STRICT JSON ONLY
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

        // 1. parse
        let parsed: any;

        try {
            parsed = JSON.parse(cleaned);
        } catch (e) {
            throw new Error("Invalid JSON from LLM");
        }

        // 2. FORCE NORMALIZATION (必须在这里)
        parsed = this.normalizeResponse(parsed);

        // 3. DEBUG（关键）
        console.log("AFTER NORMALIZE >>>", parsed);

        // 4. validate
        const validated =
            SemanticSchema.parse(parsed);

        // ======================================
        // 6. Action
        // ======================================
        const action = {
            type: validated.primaryAction as AgentAction,
            confidence: validated.confidence,
        };

        // ======================================
        // 7. Entities normalization
        // ======================================
        const entities: Entity[] = validated.entities.map((entity) => ({
            type: entity.type as EntityType,
            value: entity.value,
        }));

        // ======================================
        // 8. Build Semantic Context
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
    // Normalize Layer (核心稳定层)
    // ======================================
    private normalizeResponse(parsed: any) {

        const action =
            parsed.primaryAction ||
            parsed.action ||
            "GENERAL";

        // 1. action mapping
        if (action === "GENERAL") {

            parsed.primaryAction =
                "SEARCH_LISTING";

            parsed.actions =
                ["SEARCH_LISTING"];

        } else {

            parsed.primaryAction = action;

            parsed.actions = [
                action
            ];
        }

        // 2. entities normalize (CRITICAL FIX)
        if (!Array.isArray(parsed.entities)) {

            parsed.entities = Object.entries(
                parsed.entities || {}
            ).map(([key, value]) => ({
                type: key.toUpperCase(),
                value: String(value),
            }));
        }

        // 3. safety defaults
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
}