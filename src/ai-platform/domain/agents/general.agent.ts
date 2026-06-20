//
import { inject, injectable } from "tsyringe";
import { SemanticContext } from "../semantic/semantic-context";

import { OpenAIAdapter } from "@/ai-platform/infrastructure/adapters/openai.adapter";
import { parseAIJson } from "@/ai-platform/infrastructure/utils/parserAIJson";
import { SemanticSchema } from "@/ai-platform/schemas/semantic.schema";
import { AIContext } from "@/ai-platform/context/types/context/ai.context";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";

@injectable()
export class GeneralAgent {

  constructor(
    @inject(TOKENS_AI.OpenAIAdapter)
    private ai: OpenAIAdapter
  ) {}

  async execute(
    semantic: SemanticContext,
    _context: AIContext
  ) {
const prompt = `
You are an AI intent classifier.

Return JSON only.
response_format: { type: "json_object" }
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

Examples:

Input:
the title is not suitable

Output:
{
  "domain":"LISTING",
  "facet":"TITLE",
  "intent":"OPTIMIZE_TITLE",
  "confidence":0.92,
  "entities":{}
}

Input:
cancel booking BK-001

Output:
{
  "domain":"BOOKING",
  "intent":"CANCEL_BOOKING",
  "confidence":0.95,
  "entities":{
    "bookingId":"BK-001"
  }
}

User input:
${semantic.rawInput}
`;
    console.log(
      "GeneralAgent.execute"
    );

    console.log(
      "semantic.rawInput",
      semantic.rawInput
    );

    const response = await this.ai.generateText({ prompt });
    const raw = typeof response === 'string' ? response : JSON.stringify(response);

    console.log(
      "GPT reply:",
      raw
    );

const result = parseAIJson(raw);
console.log("result", result);
  const validated = SemanticSchema.parse(result);
    console.log(
      "validated",
      validated
    );
    return {
      reply:validated
    };
  }
}