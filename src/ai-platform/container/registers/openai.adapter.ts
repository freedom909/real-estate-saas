import { container } from "tsyringe";

import { OpenAIAdapter } from "../../infrastructure/adapters/openai.adapter";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";

export function registerOpenAIAdapter() {


  container.register(TOKENS_AI.OpenAIAdapter, {
    useClass: OpenAIAdapter,
  });
}