// src/modules/container/ai.container.ts

import { container } from "tsyringe";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { OpenAIService } from "@/subgraphs/listing/application/ai/services/OpenAIService";

container.register(TOKENS_AI.OpenAIService, {
useClass: OpenAIService,
});
export default container;