//
import { inject, injectable } from "tsyringe";
import { SemanticContext } from "../semantic/semantic-context";

import { OpenAIAdapter } from "@/ai-platform/infrastructure/adapters/openai.adapter";
import { parseAIJson } from "@/ai-platform/infrastructure/utils/parserAIJson";
import { SemanticSchema } from "@/ai-platform/schemas/semantic.schema";
import { AIContext } from "@/ai-platform/context/types/context/ai.context";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { AIDomain } from "../semantic/types/ai.domain";

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
You are an AI assistant for a minshuku (民宿) booking platform.

The user said: "${semantic.rawInput}"

Respond with a helpful, friendly message. If the user's intent is unclear, 
ask clarifying questions. If they seem to want to perform a booking or listing 
action, guide them on what you can help with.

Available actions:
- Create, cancel, confirm, complete, or view bookings
- Optimize listing titles, descriptions, or SEO
- View listing details

Reply in a conversational tone. Keep it concise.
`;

    console.log("GeneralAgent.execute — fallback for:", semantic.rawInput);

    const response = await this.ai.generateText({ prompt });
    const reply = typeof response === 'string' ? response : JSON.stringify(response);

    console.log("GeneralAgent reply:", reply);

    return {
      success: true,
      domain: AIDomain.GENERAL,
      primaryAction: {
        name: "GENERAL",
        confidence: semantic.confidence ?? 0,
      },
      summary: reply,
      artifacts: [],
    };
  }
}
