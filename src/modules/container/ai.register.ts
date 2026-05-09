// src/modules/container/ai.container.ts

import { container } from "tsyringe";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { OpenAIService } from "@/subgraphs/listing/application/ai/services/openAIService";
import { OpenAIAdapter } from "@/subgraphs/listing/infrastructure/ai/openAI.adapter";
// src/modules/container/ai.container.ts


export function registerAIContainer() {
  container.register(TOKENS_AI.OpenAIService, {
    useClass: OpenAIService,
  });

  container.register(TOKENS_AI.OpenAIAdapter, {
    useClass: OpenAIAdapter,
  });
}