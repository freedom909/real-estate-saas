// FILE: src/subgraphs/listing/container/index.ts

import { container } from 'tsyringe';
import { TOKENS_LISTING } from '@/modules/tokens/listing.tokens';
import { TOKENS_AI } from '@/modules/tokens/ai.tokens';

import { GenerateListingAIOptimizationUseCase } from '@/ai-platform/application/usecases/listing/generateListingAIOptimization.usecase';
import ListingModel from '@/core/listing/infrastructure/models/listing.model';
import { ListingRepository } from '@/core/listing/infrastructure/persistence/listing.repository';
import CreateListingUseCase from '@/core/listing/application/usecase/createListingUseCase';
import GetListingUseCase from '@/core/listing/application/usecase/getListingUseCase';
import { SearchListingUseCase } from '@/core/listing/application/usecase/searchListingUseCase';
import { RunListingAgentUseCase } from '@/core/listing/application/usecase/runListingAgentUseCase';
import AmenityAdapter from '@/core/listing/application/adapters/amenity.adapter';
import { CategoryAdapter } from '@/core/listing/application/adapters/category.adapter';
import { sequelize } from '@/infrastructure/config/seq';
import { SEOAnalysisUseCase } from '@/core/listing/application/usecase/seoAnalysisUseCase';
import ListingLocations from '@/core/listing/infrastructure/models/listingLocations.model';
import ListingAmenities from '@/core/listing/infrastructure/models/listingAmenities.model';
import ListingCategories from '@/core/listing/infrastructure/models/listingCategories.model';
import { ListingAISuggestionRepository } from '@/core/listing/infrastructure/persistence/listing.ai.suggestion.repository';


export default function registerListingDependencies() {
  container.register(TOKENS_LISTING.models.listingCategoriesModel, {
    useValue: ListingModel,
  });

  container.register(TOKENS_LISTING.repos.listingRepository, {
    useClass: ListingRepository,
  });

  container.register(TOKENS_LISTING.usecase.createListingUseCase, {
    useClass: CreateListingUseCase,
  });

  container.register(TOKENS_LISTING.usecase.getListingUseCase, {
    useClass: GetListingUseCase,
  });

  container.register(TOKENS_LISTING.usecase.searchListingUseCase, {
    useClass: SearchListingUseCase,
  });

  container.register(TOKENS_LISTING.models.listingCategoriesModel, {
    useValue: ListingCategories,
  });

  container.register(TOKENS_LISTING.models.listingAmenityModel, {
    useValue: ListingAmenities,
  });

  container.register(TOKENS_LISTING.models.listingLocationsModel, {
    useValue: ListingLocations,
  });

  container.register(TOKENS_LISTING.usecase.seoAnalysisUseCase, {
    useClass: SEOAnalysisUseCase,
  });

  container.register(TOKENS_LISTING.usecase.generateListingAIOptimizationUseCase, {
    useClass: GenerateListingAIOptimizationUseCase,
  });

  container.register(TOKENS_AI.usecase.runListingAgentUseCase, {
    useClass: RunListingAgentUseCase,
  });

  container.register(TOKENS_LISTING.adapters.amenityAdapter, {
    useClass: AmenityAdapter,
  });

  container.register(TOKENS_LISTING.adapters.categoryAdapter, {
    useClass: CategoryAdapter,
  });

  container.register(TOKENS_LISTING.sequelize, {
    useValue: sequelize,
  });

  container.register(TOKENS_LISTING.models.listingModel, {
    useValue: ListingModel,
  });

  container.register(TOKENS_LISTING.listing, {
    useValue: sequelize.models.Listing,
  });

  container.register(TOKENS_LISTING.repos.listingAISuggestionRepository, {
    useValue: ListingAISuggestionRepository,
  });

  container.register(TOKENS_LISTING.ai.listingAISuggestionModel, {
    useValue: ListingModel,
  });
}
