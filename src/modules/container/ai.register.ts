// src/modules/container/ai.container.ts

import { container } from "tsyringe";
import { TOKENS_AI } from "../tokens/ai.tokens";
import { BookingFraudAgent } from "@/subgraphs/booking/BookingFraudAgent";
import { ReviewAnalysisAgent } from "@/subgraphs/review/application/agents/ReviewAnalysisAgent";

import { OpenAIAdapter } from "@/subgraphs/listing/infrastructure/ai/openAI.adapter";
import { ListingAISuggestionRepository } from "@/subgraphs/listing/infrastructure/persistence/listing.ai.suggestion.repository";
import ListingAISuggestionModel from "@/subgraphs/listing/infrastructure/models/listing.ai.suggestion.model";

import { PriceOptimizationTool } from "@/subgraphs/listing/application/tools/priceOptimizationTool";

import { RunListingAgentUseCase } from "@/subgraphs/listing/application/use-cases/RunListingAgentUseCase";

import { BookingOptimizationTool } from "@/subgraphs/booking/infrastructure/tools/BookingOptimizationTool";

import { BookingFraudTool } from "@/subgraphs/booking/infrastructure/tools/BookingFraudTool";

import { BookingACL } from "@/subgraphs/booking/domain/entities/contexts/bookingACL";
import { ReviewACL } from "@/subgraphs/booking/domain/entities/contexts/reviewACL";
import { SEOAnalysisUseCase } from "@/subgraphs/listing/application/use-cases/seoAnalysisUseCase";
import { RunReviewAgentUseCase } from "@/subgraphs/review/application/RunReviewAgentUseCase";
import { RewriteTitleTool } from "@/subgraphs/listing/application/tools/rewriteTitleTool";
import { AIPlatformOrchestrator } from "@/ai-platform/domain/orchestration/aiPlatform.orchestrator";

import { TOKENS_ORCHESTRATOR } from "@/ai-platform/container/tokens/orchestration/orchestrator";
import { ListingOptimizationAgent } from "@/subgraphs/listing/application/agents/listingOptimizationAgent";
import { AnalyzeListingTool } from "@/subgraphs/listing/application/tools/AnalyzeListingTool";
import { CategoryOptimizationTool } from "@/subgraphs/listing/application/tools/categoryOptimizationTool";
import { GenerateSEOKeywordsTool } from "@/ai-platform/application/capabilities/generateSEOKeywords.tool";
import { RewriteDescriptionTool } from "@/subgraphs/listing/application/tools/rewriteDescriptionTool";
import { AgentRouterService } from "@/ai-platform/domain/orchestration/router/agentRouter.service";

import { CancelBookingRepository } from "@/subgraphs/booking/infrastructure/repos/cancelBookingRepository";
import { BookingRepository } from "@/subgraphs/booking/infrastructure/repos/bookingRepository";

import { CreateBookingUseCase } from "@/subgraphs/booking/application/use-cases/create-booking.use-case";
import { RunBookingAgentUseCase } from "@/subgraphs/booking/application/use-cases/runBookingAgentUseCase";
import { BookingOptimizationAgent } from "@/subgraphs/booking/BookingOptimizationAgent";
import { CancelBookingUseCase } from "@/subgraphs/booking/application/use-cases/cancel-booking.use-case";
import { BookingGateway } from "@/subgraphs/booking/BookingGateway";
import { GenerateTitleSuggestionUseCase } from "@/subgraphs/listing/application/use-cases/generateTitleSuggestionUseCase";

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

  container.register(TOKENS_AI.ListingAISuggestionRepository, {
    useClass: ListingAISuggestionRepository,
  })

  container.register(TOKENS_AI.ListingAISuggestionModel, {
    useValue: ListingAISuggestionModel,
  })

  container.register(TOKENS_AI.usecase.generateTitleSuggestionUseCase, {
    useClass: GenerateTitleSuggestionUseCase,
  })

  container.register(TOKENS_AI.usecase.seoAnalysisUseCase, {
    useClass: SEOAnalysisUseCase,
  });

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
}