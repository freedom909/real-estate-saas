// src/modules/container/ai.container.ts

import { container } from "tsyringe";
import { TOKENS_AI } from "../tokens/ai.tokens";




import { AIPlatformOrchestrator } from "@/ai-platform/domain/orchestration/aiPlatform.orchestrator";

import { TOKENS_ORCHESTRATOR } from "@/ai-platform/container/context/orchestrator/orchestrator";

import { GenerateSEOKeywordsTool } from "@/ai-platform/application/capabilities/generateSEOKeywords.tool";

import { AgentRouterService } from "@/ai-platform/domain/orchestration/router/agentRouter.service";

import { OpenAIAdapter } from "@/ai-platform/infrastructure/adapters/openai.adapter";


import { RunListingAgentUseCase } from "@/core/listing/application/usecase/runListingAgentUseCase";
import { ReviewACL } from "@/core/booking/domain/entities/contexts/ReviewACL";

import { AnalyzeListingTool } from "@/ai-platform/application/tools/analyzeListing.tool";
import { CategoryOptimizationTool } from "@/ai-platform/application/tools/categoryOptimizationTool";
import { RewriteTitleTool } from "@/ai-platform/application/tools/rewriteTitleTool";
import { RewriteDescriptionTool } from "@/ai-platform/application/tools/rewriteDescriptionTool";
import { PriceOptimizationTool } from "@/ai-platform/application/tools/priceOptimizationTool";
import { ListingOptimizationAgent } from "@/ai-platform/application/agents/listingOptimizationAgent";
import { RunBookingAgentUseCase } from "@/core/booking/application/usecases/runBookingAgent.usecase";
import { BookingOptimizationTool } from "@/core/booking/infrastructure/tools/bookingOptimization.tool";
import { BookingOptimizationAgent } from "@/core/booking/bookingOptimizationAgent";
import { BookingFraudTool } from "@/core/booking/infrastructure/tools/bookingFraud.tool";
import { BookingFraudAgent } from "@/core/booking/bookingFraud.agent";
import { TOKENS_BOOKING } from "../tokens/booking.tokens";
import { BookingACL } from "@/core/booking/domain/entities/contexts/BookingACL";
import { ReviewAnalysisAgent } from "@/core/review/application/agents/ReviewAnalysisAgent";
import { RunReviewAgentUseCase } from "@/core/review/application/runReviewAgentUseCase";
import { CancelBookingUseCase } from "@/core/booking/application/usecases/cancel-booking.usecase";
import { CreateBookingUseCase } from "@/core/booking/application/usecases/create-booking.usecase";
import { BookingRepository } from "@/core/booking/infrastructure/repos/bookingRepository";
import { CancelBookingRepository } from "@/core/booking/infrastructure/repos/cancelBookingRepository";

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


container.register(TOKENS_BOOKING.acl.bookingACL, { useClass: BookingACL });

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