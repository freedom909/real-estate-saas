import { inject, injectable } from "tsyringe";
import { SemanticExtractor } from "../semantic/extractors/semantic.extractor";
import { ChatResponse } from "../types/enums/chat.response";
import { TOKENS_EXTRACTOR } from "@/ai-platform/container/tokens/semantic/extractor";

import { TOKENS_AGENT_FACTORY } from "@/ai-platform/container/tokens/agent/factory";
import { AgentFactory } from "../agents/agent.factory";
import { TOKENS_ORCHESTRATOR } from "@/ai-platform/container/tokens/orchestration/orchestrator";
import { AgentRouterService } from "./router/agentRouterService";
import { UserContext } from "../semantic/types/userContext";


@injectable()
export class AIPlatformOrchestrator {

  constructor(
    @inject(TOKENS_EXTRACTOR.semanticExtractor)
    private semanticExtractor: SemanticExtractor,

    @inject(TOKENS_ORCHESTRATOR.agentRouterService)
    private routingService: AgentRouterService,

    // @inject(TOKENS_AGENT_FACTORY.agentFactory) // Ensure this is registered
    // private agentFactory: AgentFactory
  ) { }

async handle(
  message: string,
  user?: UserContext
): Promise<ChatResponse> {

 const semantic =
  await this.semanticExtractor.extract(
    message
  );

console.log(
  "ORCH STEP 1 semantic",
  semantic
);

const agent =
  this.routingService.route(
    semantic
  );

console.log(
  "ORCH STEP 2 agent",
  agent?.constructor?.name
);

const result =
  await agent.execute(
    semantic,
    user
  );

console.log(
  "ORCH STEP 3 result",
  result
);
    return { // プロパティ 'summary' は型 '{ success: true; planId: string; reply: any; }' にありませんが、型 'ChatResponse' では必須です。
      success: true,
      planId: "test",
      summary: [],
           reply:
        result.title
    };
}
}