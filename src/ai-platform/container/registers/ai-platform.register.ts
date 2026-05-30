import { TOKENS } from "@/shared/infra/tokens";
import { TOKENS_EXTRACTOR } from "../tokens/extractor";
import { container } from "tsyringe";
import { SemanticExtractor } from "@/ai-platform/domain/semantic/extractors/semantic.extractor";

import { ChatUseCase } from "@/ai-platform/application/use-cases/chat.use-case";
import { GeneralAgent } from "@/ai-platform/domain/agents/generalAgent";
import { RuleExtractor } from "@/ai-platform/domain/semantic/extractors/rule.extractor";
import LLMExtractor from "@/ai-platform/domain/semantic/extractors/llm.extractor";
import { RoutingService } from "@/ai-platform/domain/orchestration/router/routing.service";
import { AIPlatformOrchestrator } from "@/ai-platform/domain/orchestration/aiPlatformOrchestrator";
import { BookingAgent } from "@/ai-platform/domain/agents/booking/booking.agent";
import { ListingAgent } from "@/ai-platform/domain/agents/listing/listing.agent";
import { TOKENS_ORCHESTRATOR } from "../tokens/orchestrator";
import { TOKENS_AGENT } from "../tokens/agent/action.agent";
import { TOKENS_FACTORY } from "../tokens/factory";
import { AgentFactory } from "@/ai-platform/domain/agents/agent.factory";
import { registerAgents } from "./agent.register";
import { registerFacetResolvers } from "./facet-resolvers.register";

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
    TOKENS_ORCHESTRATOR.routingService,
    {
      useClass:
        RoutingService
    }
  );

  container.register(TOKENS_ORCHESTRATOR.aiPlatformOrchestrator,  
    {
      useClass:
        AIPlatformOrchestrator
    }
  );

  // Register Agents and Facet Resolvers
  registerAgents();
  registerFacetResolvers();

  // usecase
  container.register(
    ChatUseCase,
    {
      useClass:
        ChatUseCase
    }
  );

  container.register(
   TOKENS_FACTORY.agentFactory,
    {
      useClass:
        AgentFactory
    }
  );
}
