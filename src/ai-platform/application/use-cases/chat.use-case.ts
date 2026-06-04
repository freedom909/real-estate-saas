import { inject, injectable } from "tsyringe";


import { SemanticExtractor } from "../../domain/semantic/extractors/semantic.extractor";

import { ChatInput } from "./chat.input";


import { AIPlatformOrchestrator } from "@/ai-platform/domain/orchestration/aiPlatformOrchestrator";
import { TOKENS_ORCHESTRATOR } from "@/ai-platform/container/tokens/orchestration/orchestrator";
import { UserContext } from "@/ai-platform/domain/semantic/types/userContext";

@injectable()
export class ChatUseCase {

  constructor(
    @inject(TOKENS_ORCHESTRATOR.aiPlatformOrchestrator)
    private orchestrator:
      AIPlatformOrchestrator
  ) {}

  async execute(
    message: string,
    userInfo: UserContext
  ) {
const result =
  await this.orchestrator.handle(
    message,
    userInfo
  );

console.log(
  "FINAL RESPONSE",
  JSON.stringify(result, null, 2)
);

return result;
  }

}