// src/modules/container/ai.container.ts

import { container } from "tsyringe";
import { TOKENS_AI } from "../tokens/ai.tokens";



import { BookingFraudAgent } from "@/subgraphs/booking/BookingFraudAgent";

import { ReviewAnalysisAgent } from "@/subgraphs/review/application/agents/ReviewAnalysisAgent";

import { OpenAIAdapter } from "@/subgraphs/listing/infrastructure/ai/OpenAI.adapter";
import { ListingAISuggestionRepository } from "@/subgraphs/listing/infrastructure/persistence/listing.ai.suggestion.repository";


import ListingAISuggestionModel from "@/subgraphs/listing/infrastructure/models/listing.ai.suggestion.model";
import { GenerateTitleSuggestionUseCase } from "@/subgraphs/listing/application/use-cases/generateTitleSuggestionUseCase";

import { PriceOptimizationTool } from "@/subgraphs/listing/application/tools/priceOptimizationTool";

import { RunListingAgentUseCase } from "@/subgraphs/listing/application/use-cases/RunListingAgentUseCase";
import { RunBookingAgentUseCase } from "@/subgraphs/booking/use-cases/RunBookingAgentUseCase";
import { BookingOptimizationTool } from "@/subgraphs/booking/booking/BookingOptimizationTool";
import { BookingOptimizationAgent } from "@/subgraphs/booking/booking/BookingOptimizationAgent";
import { BookingFraudTool } from "@/subgraphs/booking/booking/BookingFraudTool";
import { BookingGateway } from "@/subgraphs/booking/domain/entities/contexts/BookingGateway";
import { BookingACL } from "@/subgraphs/booking/domain/entities/contexts/BookingACL";
import { ReviewACL } from "@/subgraphs/booking/domain/entities/contexts/ReviewACL";
import { RunReviewAgentUseCase } from "@/subgraphs/review/application/RunReviewAgentUseCase";
import { RewriteTitleTool } from "@/subgraphs/listing/application/tools/rewriteTitleTool";
import { ListingOptimizationAgent } from "@/subgraphs/listing/application/agents/listingOptimizationAgent";
import { AnalyzeListingTool } from "@/subgraphs/listing/application/tools/AnalyzeListingTool";
import { CategoryOptimizationTool } from "@/subgraphs/listing/application/tools/categoryOptimizationTool";
import { GenerateSEOKeywordsTool } from "@/subgraphs/listing/application/tools/generateSEOKeywordsTool";
import { RewriteDescriptionTool } from "@/subgraphs/listing/application/tools/rewriteDescriptionTool";



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
}