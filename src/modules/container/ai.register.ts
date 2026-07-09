// src/modules/container/ai.container.ts

import { container } from "tsyringe";
import { TOKENS_AI } from "../tokens/ai.tokens";

import { WisdomOrchestrator } from "@/wisdom/orchestration/wisdom-orchestrator";
import { WISDOM_TOKENS } from "@/wisdom/container/tokens/wisdom.tokens";


import { OpenAITool } from "@/wisdom/tools/openai.tool";

import { RunListingAgentUseCase } from "@/core/listing/application/usecase/runListingAgentUseCase";
import { ReviewACL } from "@/core/booking/domain/entities/contexts/ReviewACL";


import { ListingOptimizationAgent } from "@/wisdom/agents/listing/listingOptimization.agent";
import { RunBookingAgentUseCase } from "@/core/booking/application/usecases/runBookingAgent.usecase";
import { BookingOptimizationTool } from "@/core/booking/infrastructure/tools/bookingOptimization.tool";
import { BookingOptimizationAgent } from "@/core/booking/bookingOptimizationAgent";
import { BookingFraudTool } from "@/core/booking/infrastructure/tools/bookingFraud.tool";
import { BookingFraudAgent } from "@/core/booking/bookingFraud.agent";
import { TOKENS_BOOKING } from "../tokens/booking.tokens";
import { BookingACL } from "@/core/booking/domain/entities/contexts/BookingACL";
import { ReviewAnalysisAgent } from "@/core/review/application/agents/reviewAnalysis.agent";
import { RunReviewAgentUseCase } from "@/core/review/application/runReviewAgentUseCase";
import { CancelBookingUseCase } from "@/core/booking/application/usecases/cancel-booking.usecase";
import { CreateBookingUseCase } from "@/core/booking/application/usecases/create-booking.usecase";
import { BookingRepository } from "@/core/booking/infrastructure/repos/bookingRepository";
import { CancelBookingRepository } from "@/core/booking/infrastructure/repos/cancelBookingRepository";
import { AnalyzeListingTool } from "@/wisdom/tools/analyzeListing.tool";
import { CategoryOptimizationTool } from "@/wisdom/tools/categoryOptimizationTool";
import { GenerateSEOKeywordsTool } from "@/wisdom/capabilities/generateSEOKeywords.tool";
import { RewriteTitleTool } from "@/wisdom/tools/rewriteTitleTool";
import { RewriteDescriptionTool } from "@/wisdom/tools/rewriteDescriptionTool";
import { PriceOptimizationTool } from "@/wisdom/tools/priceOptimizationTool";

export function registerAIContainer() {

// Wisdom orchestrator replaces old AIPlatformOrchestrator + AgentRouterService
container.register(WISDOM_TOKENS.orchestrator, {
  useClass: WisdomOrchestrator,
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

container.register(TOKENS_AI.agent.reviewAnalysisAgent, {
  useClass: ReviewAnalysisAgent,
});

container.register(TOKENS_AI.usecase.runReviewAgentUseCase, {
  useClass: RunReviewAgentUseCase,
});

container.register(TOKENS_AI.agent.bookingOptimizationAgent, {
  useClass: BookingOptimizationAgent,
});

container.register(TOKENS_AI.agent.bookingFraudAgent, {
  useClass: BookingFraudAgent,
});

container.register(TOKENS_AI.usecase.runBookingAgentUseCase, {
  useClass: RunBookingAgentUseCase,
});

container.register(TOKENS_AI.tool.bookingOptimizationTool, {
  useClass: BookingOptimizationTool,
});

container.register(TOKENS_AI.tool.bookingFraudTool, {
  useClass: BookingFraudTool,
});

container.register(TOKENS_AI.acl.bookingACL, {
  useClass: BookingACL,
});

container.register(TOKENS_AI.acl.reviewACL, {
  useClass: ReviewACL,
});

container.register(TOKENS_BOOKING.usecase.cancelBookingUseCase, {
  useClass: CancelBookingUseCase,
});

container.register(TOKENS_BOOKING.usecase.createBookingUseCase, {
  useClass: CreateBookingUseCase,
});

container.register(TOKENS_BOOKING.repository.bookingRepository, {
  useClass: BookingRepository,
});

container.register(TOKENS_BOOKING.repository.cancelBookingRepository, {
  useClass: CancelBookingRepository,
});

}
