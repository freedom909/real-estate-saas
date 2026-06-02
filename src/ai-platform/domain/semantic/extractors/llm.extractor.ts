import { inject, injectable } from "tsyringe";
import { SemanticContext, Entity } from "../semantic-context";
import { TOKENS_AI_ADAPTER } from "@/ai-platform/container/tokens/ai.adapter";
import { OpenAIAdapter } from "@/ai-platform/infrastructure/adapters/openai.adapter";
import { AISuggestionSchema } from "@/ai-platform/schemas/aiSuggestionSchema";
import { IntentSchema } from "@/ai-platform/schemas/intentSchema";

@injectable()
export default class LLMExtractor {

  constructor(
    @inject(TOKENS_AI_ADAPTER.aiAdapter)
    private ai: OpenAIAdapter
  ) { }

  async extract(
    message: string
  ): Promise<SemanticContext> {

    const prompt = `
You are an AI intent classifier.

No markdown.
Return ONLY valid JSON.

Domains:
- LISTING
- BOOKING
- REVIEW
- GENERAL

Intents:
- OPTIMIZE_TITLE
- CANCEL_BOOKING
- REFUND
- GENERAL

Output format:

{
 "domain":"",
 "facet":"",
 "intent":"",
 "confidence":0,
 "entities":{}
}

User input:
${message}
`;

    const raw =
      await this.ai.generateText({
        prompt
      });
console.log("RAW AI", raw);
    // clean markdown
    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // parse raw json
    const parsed =
      JSON.parse(cleaned);
console.log("PARSED", parsed);
    // validate with zod
    const validated =
      IntentSchema.parse(parsed);
console.log("VALIDATED", validated);
    const intents = [
      {
        name: validated.intent,//
        confidence:
          validated.confidence,
      }
    ];

const entities: Entity[] =
  Object.entries(
    validated.entities ?? {}
  ).map(([type, value]) => {

    const normalizedType =
      type
        .replace(/\./g, "_")
        .replace(/-/g, "_")
        .replace(
          /([a-z])([A-Z])/g,
          "$1_$2"
        )
        .toLowerCase();

    return {
      type: normalizedType,
      value: String(value),
      confidence:
        validated.confidence
    };
});
console.log("ENTITIES", entities);

    return new SemanticContext(
      message,
      intents,
      entities,
      validated.confidence
    );
  }
}