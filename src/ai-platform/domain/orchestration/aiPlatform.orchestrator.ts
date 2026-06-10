import { inject, injectable } from "tsyringe";
import { TOKENS_EXTRACTOR } from "@/ai-platform/container/tokens/semantic/extractor";
import { TOKENS_ORCHESTRATOR } from "@/ai-platform/container/context/orchestrator/orchestrator";

import { AgentRouterService } from "./router/agentRouter.service";
import { ISemanticExtractor } from "../semantic/types/i-semantic.extractor";
import { AIRequest } from "@/ai-platform/context/types/context/ai.context";
import { AgentResult } from "@/ai-platform/context/types/context/agent.result";

@injectable()
export class AIPlatformOrchestrator {

  constructor(

    @inject(TOKENS_EXTRACTOR.semanticExtractor)
    private semanticExtractor: ISemanticExtractor,

    @inject(TOKENS_ORCHESTRATOR.agentRouterService)
    private routingService: AgentRouterService

  ) { }
  async handle(
    request: AIRequest
  ): Promise<AgentResult> {

    const semantic =
      await this.semanticExtractor.extract(
        request
      );

    const agent =
      this.routingService.route(
        semantic
      );

    const result = await agent.execute(
      semantic,
      request.context
    ) as AgentResult;
    console.log("AGENT RESULT++",
      Object.keys(result)
    );
    return result;
  }
}