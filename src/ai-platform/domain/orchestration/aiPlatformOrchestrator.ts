import { inject, injectable } from "tsyringe";
import { SemanticExtractor } from "../semantic/extractors/semantic.extractor";
import { ChatResponse } from "../types/enums/chat.response";
import { TOKENS_EXTRACTOR } from "@/ai-platform/container/tokens/semantic/extractor";

import { TOKENS_ORCHESTRATOR } from "@/ai-platform/container/tokens/orchestration/orchestrator";

import { UserContext } from "../semantic/types/userContext";
import { AgentRouterService } from "./router/agentRouter.service";
import { AIRequest } from "../types/context/aiContext";
import { AgentResult } from "../types/context/agent.result";


@injectable()
export class AIPlatformOrchestrator {

  constructor(
    @inject(TOKENS_EXTRACTOR.semanticExtractor)
    private semanticExtractor: SemanticExtractor,

    @inject(TOKENS_ORCHESTRATOR.agentRouterService)
    private routingService: AgentRouterService,

  ) { }
  async handle(
    request: AIRequest
  ): Promise<AgentResult> {

    const semantic =
      await this.semanticExtractor.extract(
        request.message
      );

    const agent =
      this.routingService.route(
        semantic
      );

      const result =  await agent.execute(
      semantic,
      request.context
    ) as AgentResult;
    console.log("AGENT RESULT++",
  Object.keys(result)
);
    return result;
  }
}