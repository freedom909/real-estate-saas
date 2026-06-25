// src/wisdom/agents/general.agent.ts

import { inject, injectable } from "tsyringe";
import { IDomainAgent } from "../contracts/agent";
import { SemanticContext } from "../semantic/semantic-context";
import { AIContext } from "../contracts/ai-context";
import { WisdomResponse } from "../contracts/response";
import { AIDomain } from "../shared/enums/domain.enum";
import { OpenAITool} from "@/wisdom/tools/openai.tool";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";

@injectable()
export class GeneralAgent implements IDomainAgent {
  constructor(
    @inject(TOKENS_AI.OpenAITool)
    private ai: OpenAITool,
  ) {}

  async execute(semantic: SemanticContext, _context: AIContext): Promise<WisdomResponse> {
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

    const response = await this.ai.generateText({ prompt });
    const reply = typeof response === "string" ? response : JSON.stringify(response);

    return {
      success: true,
      domain: AIDomain.GENERAL,
      primaryAction: { name: "GENERAL", confidence: semantic.confidence ?? 0 },
      summary: reply,
      artifacts: [],
    };
  }
}
