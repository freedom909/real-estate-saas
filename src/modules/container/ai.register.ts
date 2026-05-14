// src/modules/container/ai.container.ts

import { container } from "tsyringe";
import { TOKENS_AI } from "../tokens/ai.tokens";
import { AnalyzeListingTool } from "@/subgraphs/ai/application/tools/listing/AnalyzeListingTool";
import { CategoryOptimizationTool } from "@/subgraphs/ai/application/tools/listing/CategoryOptimizationTool";
import { GenerateSEOKeywordsTool } from "@/subgraphs/ai/application/tools/listing/GenerateSEOKeywordsTool";

import { PriceOptimizationTool } from "@/subgraphs/ai/application/tools/listing/PriceOptimizationTool";
import { RewriteDescriptionTool } from "@/subgraphs/ai/application/tools/listing/RewriteDescriptionTool";
import { RewriteTitleTool } from "@/subgraphs/ai/application/tools/listing/RewriteTitleTool";
import { ListingOptimizationAgent } from "@/subgraphs/ai/application/agents/listing/ListingOptimizationAgent";
import { RunListingAgentUseCase } from "@/subgraphs/ai/application/usecases/RunListingAgentUseCase";
import { RunBookingAgentUseCase } from "@/subgraphs/ai/application/usecases/RunBookingAgentUseCase";

import { BookingOptimizationAgent } from "@/subgraphs/ai/application/agents/booking/BookingOptimizationAgent";
import { BookingOptimizationTool } from "@/subgraphs/ai/application/tools/booking/BookingOptimizationTool";
import { BookingFraudTool } from "@/subgraphs/ai/application/tools/booking/BookingFraudTool";
import { BookingFraudAgent } from "@/subgraphs/ai/application/agents/booking/BookingFraudAgent";
import { BookingGateway } from "@/subgraphs/ai/domain/entities/contexts/BookingGateway";
import { BookingACL } from "@/subgraphs/ai/domain/entities/contexts/BookingACL";
import { ReviewACL } from "@/subgraphs/ai/domain/entities/contexts/ReviewACL";
import { ReviewAnalysisAgent } from "@/subgraphs/ai/application/agents/review/ReviewAnalysisAgent";
import { RunReviewAgentUseCase } from "@/subgraphs/ai/application/usecases/RunReviewAgentUseCase";



export function registerAIContainer() {

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


}