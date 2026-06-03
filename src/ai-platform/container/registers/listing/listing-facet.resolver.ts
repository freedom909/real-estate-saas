//

import { container } from "tsyringe";

import { TOKENS_LISTING_FACET_RESOLVERS } from "../../tokens/facet/listing.facet";
import { OptimizeContentExecutor } from "@/ai-platform/domain/semantic/extractors/optimize-content.executor";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { GenerateTitleSuggestionUseCase } from "@/subgraphs/listing/application/use-cases/generateTitleSuggestionUseCase";
import { GenerateContentExecutor } from "@/ai-platform/domain/semantic/extractors/generate-content.executor";
import { ListingRepository } from "@/subgraphs/listing/domain/entities/listingRepository";
import ListingModel from "@/subgraphs/listing/infrastructure/models/listing.model";
import { ListingAISuggestionRepository } from "@/subgraphs/listing/infrastructure/persistence/listing.ai.suggestion.repository";
import ListingAISuggestionModel from "@/subgraphs/listing/infrastructure/models/listing.ai.suggestion.model";

export async function listingFacetResolver() {
  container.register(TOKENS_LISTING_FACET_RESOLVERS.optimizeContentExecutor, {
    useClass: OptimizeContentExecutor,
  });

  container.register(TOKENS_LISTING_FACET_RESOLVERS.generateContentExecutor, {
    useClass: GenerateContentExecutor,
  });

  container.register(TOKENS_AI.usecase.generateTitleSuggestionUseCase, {
    useClass: GenerateTitleSuggestionUseCase,
   });

  container.register(TOKENS_LISTING.ListingModel, { useValue: ListingModel });
  container.register(TOKENS_LISTING.ListingRepository, { useClass: ListingRepository });
  container.register(TOKENS_AI.ListingAISuggestionRepository, {
    useClass: ListingAISuggestionRepository,
  });
  container.register(TOKENS_AI.ListingAISuggestionModel, {
    useValue: ListingAISuggestionModel,
  });
}