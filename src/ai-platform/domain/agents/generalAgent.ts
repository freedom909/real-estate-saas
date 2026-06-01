//
import { inject, injectable } from "tsyringe";
import { SemanticContext } from "../semantic/semantic-context";
import { TOKENS_AI_ADAPTER } from "@/ai-platform/container/tokens/ai.adapter";
import { OpenAIAdapter } from "@/ai-platform/infrastructure/adapters/openai.adapter";
import { parseAIJson } from "@/ai-platform/infrastructure/utils/parserAIJson";

@injectable()
export class GeneralAgent {

  constructor(
    @inject(TOKENS_AI_ADAPTER.aiAdapter)
    private ai: OpenAIAdapter
  ) {}

  async execute(
    semantic: SemanticContext
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

    const reply =await this.ai.generateText({
        prompt
      });

    console.log(
      "GPT reply:",
      reply
    );
const parsed =
  JSON.parse(reply);
    return {
      reply:parsed
    };
  }
}