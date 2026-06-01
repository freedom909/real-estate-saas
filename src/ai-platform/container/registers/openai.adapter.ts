import { container } from "tsyringe";
import { TOKENS_AI_ADAPTER } from "../tokens/ai.adapter";
import { OpenAIAdapter } from "../../infrastructure/adapters/openai.adapter";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";

export function registerOpenAIAdapter() {
  container.register(
    TOKENS_AI_ADAPTER.aiAdapter,
    {
      useClass: OpenAIAdapter
    }
  );

  container.register(TOKENS_AI.OpenAIAdapter, {
    useClass: OpenAIAdapter,
  });
}