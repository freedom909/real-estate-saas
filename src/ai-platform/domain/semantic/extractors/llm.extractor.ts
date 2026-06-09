//
import { inject, injectable } from "tsyringe";

import {
  SemanticContext,
  Entity,
  EntityType,
  AgentAction,

} from "../semantic-context";

import {
  TOKENS_AI_ADAPTER
} from "@/ai-platform/container/tokens/ai.adapter";

import { OpenAIAdapter }
  from "@/ai-platform/infrastructure/adapters/openai.adapter";

import { AIDomain }
  from "../types/ai.domain";

import {
  SemanticSchema
} from "@/ai-platform/schemas/semantic.schema";



@injectable()
export default class LLMExtractor {

  constructor(
    @inject(TOKENS_AI_ADAPTER.aiAdapter)
    private ai: OpenAIAdapter
  ) {}

  async extract(
    message: string
  ): Promise<SemanticContext> {

    const prompt = `
You are an AI intent classifier.

Return ONLY valid JSON.

No markdown.
No explanation.

Domains:
- LISTING
- BOOKING
- REVIEW
- GENERAL

Actions:
- OPTIMIZE_TITLE
- GENERATE_DESCRIPTION
- REPLY_REVIEW
- CANCEL_BOOKING
- REFUND
- GENERAL

Output format:

{
  "domain":"LISTING",
  "action":"OPTIMIZE_TITLE",
  "confidence":0.95,
  "entities":{
    "listing_id":"123"
  }
}

User input:
${message}
`;

    const raw =
      await this.ai.generateText({
        prompt
      });

    console.log("RAW AI", raw);

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed =
      JSON.parse(cleaned);

    console.log(
      "PARSED",
      parsed
    );

    const validated =
      SemanticSchema.parse(parsed);

    console.log(
      "VALIDATED",
      validated
    );

    const action = {
      type:
        validated.primaryAction as AgentAction,

      confidence:
        validated.confidence
    };

    const entities: Entity[] =
      Object.entries(
        validated.entities ?? {}
      ).map(([type, value]) => {

        const normalized =
          type
            .replace(/\./g, "_")
            .replace(/-/g, "_")
            .replace(
              /([a-z])([A-Z])/g,
              "$1_$2"
            )
            .toLowerCase();

        return {
          type:
            normalized as EntityType,

          value:
            String(value)
        };
      });

    console.log(
      "ENTITIES",
      entities
    );

    return new SemanticContext(
      message,
      entities,
      action,
      validated.confidence,
      validated.domain as AIDomain,
      false
    );
  }
}

