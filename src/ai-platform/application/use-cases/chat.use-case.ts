import { inject, injectable } from "tsyringe";

import { AIPlatformOrchestrator } from "@/ai-platform/domain/orchestration/aiPlatformOrchestrator";
import { TOKENS_ORCHESTRATOR } from "@/ai-platform/container/tokens/orchestration/orchestrator";
import { AIRequest } from "@/ai-platform/domain/types/context/aiContext";

@injectable()
export class ChatUseCase {

  constructor(
    @inject(TOKENS_ORCHESTRATOR.aiPlatformOrchestrator)
    private orchestrator:
      AIPlatformOrchestrator
  ) { }

  async execute(
    request: AIRequest
  ) {

    const result =
      await this.orchestrator.handle(
        request
      );

    console.log(
      "FINAL RESPONSE",
      JSON.stringify(result, null, 2)
    );

    return result;
  }
}