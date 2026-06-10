import { TOKENS } from "@/shared/infra/tokens";
import { TOKENS_EXTRACTOR } from "../tokens/semantic/extractor";
import { container } from "tsyringe";
import { SemanticExtractor } from "@/ai-platform/domain/semantic/extractors/semantic.extractor";


import { GeneralAgent } from "@/ai-platform/domain/agents/generalAgent";
import { RuleExtractor } from "@/ai-platform/domain/semantic/extractors/rule.extractor";
import LLMExtractor from "@/ai-platform/domain/semantic/extractors/llm.extractor";

import { AIPlatformOrchestrator } from "@/ai-platform/domain/orchestration/aiPlatform.orchestrator";

import { ListingAgent } from "@/ai-platform/domain/agents/listing/listing.agent";
import { TOKENS_ORCHESTRATOR } from "../context/orchestrator/orchestrator";
import { TOKENS_AGENT } from "../agents/agent.token";
import { TOKENS_AGENT_FACTORY } from "../agents/factory.token";

import { registerAgents } from "./agent.register";

import { registerOpenAIAdapter } from "./openai.adapter";
import { AgentFactory } from "@/ai-platform/domain/agents/agent.factory";
import { AgentRouterService } from "@/ai-platform/domain/orchestration/router/agentRouter.service";
import registerListingDependencies from "@/modules/container/listing.register";
import { registerAIContainer } from "@/modules/container/ai.register";
import { registerEventBus } from "@/modules/container/event.bus.register";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { ChatUseCase } from "@/ai-platform/application/usecases/chatUseCase";


export default function
AIPlatformDependencies() {

  // extractors
  container.register(
    TOKENS_EXTRACTOR.ruleExtractor,
    {
      useClass:
        RuleExtractor
    }
  );

  container.register(
   TOKENS_EXTRACTOR.llmExtractor,
    {
      useClass:
        LLMExtractor
    }
  );

  container.register(
    TOKENS_EXTRACTOR.semanticExtractor,
    {
      useClass:
        SemanticExtractor
    }
  );

  // services
  container.register(
    TOKENS_ORCHESTRATOR.agentRouterService,
    {
      useClass:
        AgentRouterService
    }
  );

  container.register(TOKENS_ORCHESTRATOR.aiPlatformOrchestrator,  
    {
      useClass:
        AIPlatformOrchestrator
    }
  );

  registerEventBus();

  // Register Agents and Facet Resolvers
  registerAgents();
 
  registerOpenAIAdapter();

  registerListingDependencies();

  registerAIContainer();

  // usecase
  container.register(TOKENS_AI.usecase.chatUseCase,
    {
      useClass:
        ChatUseCase 
    }
  );

  container.register(
   TOKENS_AGENT.generalAgent,
    {
      useClass:
        GeneralAgent
    }
  );

  container.register(
    TOKENS_AGENT.listingAgent,
    {
      useClass:ListingAgent
    }
  );
  container.register(
    TOKENS_AGENT_FACTORY.agentFactory,
    {
      useClass:AgentFactory
    }
  );



}
