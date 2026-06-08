//src/

import { TOKENS_ORCHESTRATOR } from "@/ai-platform/container/tokens/orchestration/orchestrator";
import { AgentResult } from "@/ai-platform/context/types/context/agent.result";
import { AIRequest } from "@/ai-platform/context/types/context/aiContext";
import { AIPlatformOrchestrator } from "@/ai-platform/domain/orchestration/aiPlatform.orchestrator";
import { inject, injectable } from "tsyringe";

@injectable()
export class ChatUseCase {
    
  constructor(
    @inject(TOKENS_ORCHESTRATOR.aiPlatformOrchestrator)
    private orchestrator: AIPlatformOrchestrator
  ) {}

  async execute(request: AIRequest): Promise<AgentResult> {
    return await this.orchestrator.handle(request);
  }

}