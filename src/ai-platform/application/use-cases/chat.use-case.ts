import { inject, injectable } from "tsyringe";


import { SemanticExtractor } from "../../domain/semantic/extractors/semantic.extractor";
import { Planner } from "../../domain/planning/planners/planner";
import { SequentialRuntime } from "../../domain/runtime/executors/sequential.runtime";
import { ChatInput } from "./chat.input";
import { TaskStatus } from "../../domain/planning/types/enums";
import { ChatResponse, UserContext } from "../../domain/types/enums/chat.response";
import { AIPlatformOrchestrator } from "@/ai-platform/domain/orchestration/aiPlatformOrchestrator";
import { TOKENS_ORCHESTRATOR } from "@/ai-platform/container/tokens/orchestration/orchestrator";

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

    return this.orchestrator.handle(
      message,
      userInfo
    );
  }
}