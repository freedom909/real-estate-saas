// FILE: src/subgraphs/listing/container/index.ts

import { container } from 'tsyringe';
import { TOKENS_LISTING } from '@/modules/tokens/listing.tokens';
import { TOKENS_AI } from '@/modules/tokens/ai.tokens';
import ListingModel from '@/subgraphs/listing/infrastructure/models/listing.model';

import CreateListingUseCase from '../../subgraphs/listing/application/use-cases/createListingUseCase';

import ListingAmenityModel from '@/subgraphs/listing/infrastructure/models/listingAmenities.model';
import ListingCategoriesModel from '@/subgraphs/listing/infrastructure/models/listingCategories.model';
import ListingLocationsModel from '@/subgraphs/listing/infrastructure/models/listingLocations.model';

import AmenityAdapter from '@/subgraphs/listing/adapters/amenity.adapter';
import { CategoryAdapter } from '@/subgraphs/listing/adapters/category.adapter';
import { sequelize } from '@/infrastructure/config/seq';
import GetListingUseCase from '@/subgraphs/listing/application/use-cases/getListingUseCase';
import { RunListingAgentUseCase } from '@/subgraphs/listing/application/use-cases/runListingAgentUseCase';
import { ListingRepository } from '@/subgraphs/listing/infrastructure/persistence/listing.repository';
import { GenerateTitleSuggestionUseCase } from '@/subgraphs/listing/application/use-cases/generateTitleSuggestionUseCase';
import { SEOAnalysisUseCase } from '@/subgraphs/listing/application/use-cases/seoAnalysisUseCase';
import { GenerateDescriptionSuggestionUseCase } from '@/subgraphs/listing/application/use-cases/generateDescriptionSuggestionUseCase';
import { ListingAISuggestion } from '@/subgraphs/listing/domain/entities/listingAISuggestion';


export default function registerListingDependencies() {
  container.register(TOKENS_LISTING.listingModel, {
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

container.register(TOKENS_LISTING.listingCategoriesModel, {
  useValue: ListingCategoriesModel,
});

container.register(TOKENS_LISTING.listingAmenityModel, {
  useValue: ListingAmenityModel,
});

container.register(TOKENS_LISTING.listingLocationsModel, {
  useValue: ListingLocationsModel,
});

container.register(TOKENS_LISTING.usecase.seoAnalysisUseCase, {
  useClass: SEOAnalysisUseCase,
});

container.register(TOKENS_LISTING.usecase.generateDescriptionSuggestionUseCase, {
  useClass: GenerateDescriptionSuggestionUseCase,
});

container.register(TOKENS_LISTING.usecase.generateTitleSuggestionUseCase, {
  useClass: GenerateTitleSuggestionUseCase,
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

container.register(TOKENS_LISTING.repos.aiSuggestion, {
  useClass: ListingAISuggestion,
});

container.register(TOKENS_LISTING.listing,{
  useValue: sequelize.models.Listing,
});

}