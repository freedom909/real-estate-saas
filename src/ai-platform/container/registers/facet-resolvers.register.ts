//
import { container } from "tsyringe";
import { TOKENS_FACET_RESOLVERS } from "../tokens/facet/facet.resolver";
import { ListingFacetResolver } from "@/ai-platform/domain/agents/listing/facets/listing-facet.resolver";
import { BookingFacetResolver } from "@/ai-platform/domain/agents/booking/facets/booking-facet.resolver";
import { PaymentFacetResolver } from "@/ai-platform/domain/agents/payment/facets/payment-facet.resolver";
import {OptimizeContentExecutor}  from "@/ai-platform/domain/semantic/extractors/optimize-content.executor";
import { GenerateContentExecutor } from "@/ai-platform/domain/semantic/extractors/generate-content.executor";
import { TOKENS_LISTING_FACET_RESOLVERS } from "../tokens/facet/listing.facet";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { GenerateTitleSuggestionUseCase } from "@/subgraphs/listing/application/use-cases/generateTitleSuggestionUseCase";
import { ListingRepository } from "@/subgraphs/listing/domain/entities/ListingRepository";
import ListingModel from "@/subgraphs/listing/infrastructure/models/listing.model";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { ListingAISuggestionRepository } from "@/subgraphs/listing/infrastructure/persistence/listing.ai.suggestion.repository";
import ListingAISuggestionModel from "@/subgraphs/listing/infrastructure/models/listing.ai.suggestion.model";

export function registerFacetResolvers() {
  // Register Executors used by resolvers
  container.register(TOKENS_LISTING_FACET_RESOLVERS.optimizeContentExecutor, { useClass: OptimizeContentExecutor });
  container.register(TOKENS_LISTING_FACET_RESOLVERS.generateContentExecutor, { useClass: GenerateContentExecutor });

  // Register Domain Repositories and Models required by use cases
  container.register(TOKENS_LISTING.ListingModel, { useValue: ListingModel });
  container.register(TOKENS_LISTING.ListingRepository, { useClass: ListingRepository });
  container.register(TOKENS_AI.ListingAISuggestionRepository, { useClass: ListingAISuggestionRepository });
  container.register(TOKENS_AI.ListingAISuggestionModel, { useValue: ListingAISuggestionModel });

  // Register Use Cases required by executors
  container.register(TOKENS_AI.usecase.generateTitleSuggestionUseCase, { useClass: GenerateTitleSuggestionUseCase });

  // Register Resolvers using tokens
  container.register(TOKENS_FACET_RESOLVERS.listingFacetResolver, {
    useClass: ListingFacetResolver,
  });
  container.register(TOKENS_FACET_RESOLVERS.bookingFacetResolver, {
    useClass: BookingFacetResolver,
  });
  container.register(TOKENS_FACET_RESOLVERS.paymentFacetResolver, {
    useClass: BookingFacetResolver, // Fallback until PaymentFacetResolver is implemented
  });
}