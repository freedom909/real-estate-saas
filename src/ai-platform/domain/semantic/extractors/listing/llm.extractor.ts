//
import { inject, injectable } from "tsyringe";

import {
  SemanticContext,
  Entity,
  EntityType,
  AgentAction,

} from "../../semantic-context";



import { OpenAIAdapter }
  from "@/ai-platform/infrastructure/adapters/openai.adapter";

import { AIDomain }
  from "../../types/ai.domain";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { ListingOptimizationResult } from "@/core/listing/application/dto/listingOptimization.result";
import { SemanticSchema } from "@/ai-platform/schemas/semantic.schema";





@injectable()
export default class LLMExtractor {

  constructor(
    @inject(TOKENS_AI.OpenAIAdapter)
    private ai: OpenAIAdapter
  ) { }

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

    const response = await this.ai.generateText({
      prompt
    })  as unknown as ListingOptimizationResult;

    console.log("RAW AI", response);
    const raw = typeof response === 'string' ? response : JSON.stringify(response);

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    console.log(
  "CLEANED AI >>>",
  cleaned
);

 let parsed;

try {

  parsed = JSON.parse(cleaned);

} catch (error) {

  console.error(
    "JSON PARSE ERROR"
  );

  console.error(cleaned);

  throw error;
}

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
    console.log(
      "ACTION",
      action
    );

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
