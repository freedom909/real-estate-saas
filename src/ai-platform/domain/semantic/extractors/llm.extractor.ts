// 

import { inject, injectable } from "tsyringe";
import { SemanticContext, Entity } from "../semantic-context";
import { TOKENS_AI_ADAPTER } from "@/ai-platform/container/tokens/ai.adapter";
import { OpenAIAdapter } from "@/ai-platform/infrastructure/adapters/openai.adapter";

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

Return JSON only.

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

    const response =
      await this.ai.generateText({
        prompt
      });

    const parsed =
      JSON.parse(response);

    const intents = [
      {
        name: parsed.intent,
        confidence: parsed.confidence,
      }
    ];

    const entities: Entity[] = Object.entries(parsed.entities ?? {}).map(([type, value]) => ({
      type,
      value: String(value),
      confidence: parsed.confidence
    }));

    return new SemanticContext(
      message,
      intents,
      entities,
      parsed.confidence
    );
  }
}
