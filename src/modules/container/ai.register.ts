// src/modules/container/ai.container.ts

import { container } from "tsyringe";
import { TOKENS_AI } from "../tokens/ai.tokens";
import { BookingFraudAgent } from "@/subgraphs/booking/bookingFraud.agent";
import { ReviewAnalysisAgent } from "@/subgraphs/review/application/agents/ReviewAnalysisAgent";



import { AIPlatformOrchestrator } from "@/ai-platform/domain/orchestration/aiPlatform.orchestrator";

import { TOKENS_ORCHESTRATOR } from "@/ai-platform/container/context/orchestrator/orchestrator";

import { GenerateSEOKeywordsTool } from "@/ai-platform/application/capabilities/generateSEOKeywords.tool";

import { AgentRouterService } from "@/ai-platform/domain/orchestration/router/agentRouter.service";

import { CancelBookingRepository } from "@/subgraphs/booking/infrastructure/repos/cancelBookingRepository";
import { BookingRepository } from "@/subgraphs/booking/infrastructure/repos/bookingRepository";

import { BookingOptimizationAgent } from "@/subgraphs/booking/bookingOptimizationAgent";

import { BookingGateway } from "@/subgraphs/booking/bookingGateway";

import { BookingOptimizationTool } from "@/subgraphs/booking/infrastructure/tools/bookingOptimization.tool";
import { RunBookingAgentUseCase } from "@/subgraphs/booking/application/usecases/runBookingAgent.usecase";
import { BookingFraudTool } from "@/subgraphs/booking/infrastructure/tools/bookingFraud.tool";
import { BookingACL } from "@/subgraphs/booking/application/adapter/bookingACL";

import { OpenAIAdapter } from "@/ai-platform/infrastructure/adapters/openai.adapter";
import { CancelBookingUseCase } from "@/subgraphs/booking/application/usecases/cancel-booking.usecase";
import { CreateBookingUseCase } from "@/subgraphs/booking/application/usecases/create-booking.usecase";

import { RunListingAgentUseCase } from "@/core/listing/application/usecase/runListingAgentUseCase";
import { ReviewACL } from "@/core/booking/domain/entities/contexts/ReviewACL";
import { RunReviewAgentUseCase } from "@/subgraphs/review/application/RunReviewAgentUseCase";
import { AnalyzeListingTool } from "@/ai-platform/application/tools/analyzeListing.tool";
import { CategoryOptimizationTool } from "@/ai-platform/application/tools/categoryOptimizationTool";
import { RewriteTitleTool } from "@/ai-platform/application/tools/rewriteTitleTool";
import { RewriteDescriptionTool } from "@/ai-platform/application/tools/rewriteDescriptionTool";
import { PriceOptimizationTool } from "@/ai-platform/application/tools/priceOptimizationTool";
import { ListingOptimizationAgent } from "@/ai-platform/application/agents/listingOptimizationAgent";

export function registerAIContainer() {

container.register(TOKENS_ORCHESTRATOR.aiPlatformOrchestrator, {
  useClass: AIPlatformOrchestrator,
});

container.register(TOKENS_ORCHESTRATOR.agentRouterService, {
  useClass: AgentRouterService,
});

container.register(TOKENS_AI.tool.analyzeListingTool, {
  useClass: AnalyzeListingTool,
});

container.register(TOKENS_AI.tool.categoryOptimizationTool, {
  useClass: CategoryOptimizationTool,
});

container.register(TOKENS_AI.tool.generateSEOKeywordsTool, {
  useClass: GenerateSEOKeywordsTool,
});

container.register(TOKENS_AI.tool.rewriteTitleTool, {
  useClass: RewriteTitleTool,
});

container.register(TOKENS_AI.tool.rewriteDescriptionTool, {
  useClass: RewriteDescriptionTool,
});

container.register(TOKENS_AI.tool.priceOptimizationTool, {
  useClass: PriceOptimizationTool,
});

container.register(TOKENS_AI.agent.listingOptimizationAgent, {
  useClass: ListingOptimizationAgent,
});

container.register(TOKENS_AI.usecase.runListingAgentUseCase, {
  useClass: RunListingAgentUseCase,
});

container.register(TOKENS_AI.usecase.runBookingAgentUseCase, {
  useClass: RunBookingAgentUseCase,
});

container.register(TOKENS_AI.tool.bookingOptimizationTool, {
  useClass: BookingOptimizationTool,
});

container.register(TOKENS_AI.agent.bookingOptimizationAgent, {
  useClass: BookingOptimizationAgent,
});

container.register(TOKENS_AI.tool.bookingFraudTool, {
  useClass: BookingFraudTool,
});

container.register(TOKENS_AI.agent.bookingFraudAgent, {
  useClass: BookingFraudAgent,
});

container.register(BookingGateway, { useClass: BookingGateway });
container.register(BookingACL, { useClass: BookingACL });

container.register(TOKENS_AI.acl.reviewACL, {
  useClass: ReviewACL,
});

container.register(TOKENS_AI.agent.reviewAnalysisAgent, {
  useClass: ReviewAnalysisAgent,
});

container.register(TOKENS_AI.usecase.runReviewAgentUseCase, {
  useClass: RunReviewAgentUseCase,
});

container.register(
  TOKENS_AI.OpenAIAdapter,
  {
    useClass:
      OpenAIAdapter
  })

  container.register(TOKENS_AI.usecase.cancelBookingUseCase, {
    useClass: CancelBookingUseCase,
  })

  container.register(TOKENS_AI.usecase.createBookingUseCase, {
    useClass: CreateBookingUseCase,
  })

  container.register(TOKENS_AI.repos.bookingRepository, {
    useClass: BookingRepository,
  })

  container.register(TOKENS_AI.repos.cancelBookingRepository, {
    useClass: CancelBookingRepository,
  })

  container.register(TOKENS_AI.usecase.llmProvider, {
    useClass: OpenAIAdapter,
  })

  container.register(TOKENS_AI.repos.listingAISuggestionRepository, {
    useClass: ListingOptimizationAgent,
  })
}