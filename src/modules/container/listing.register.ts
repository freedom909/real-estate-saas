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
import { ApplyDescriptionSuggestionUseCase } from '@/subgraphs/listing/application/use-cases/applyDescriptionSuggestionUseCase';
import { ApplyTitleSuggestionUseCase } from '@/subgraphs/listing/application/use-cases/applyTitleSuggestionUseCase';
import { RunListingAgentUseCase } from '@/subgraphs/listing/application/use-cases/RunListingAgentUseCase';
import { ListingRepository } from '@/subgraphs/listing/infrastructure/persistence/listing.repository';





export default function registerListingDependencies() {
  container.register(TOKENS_LISTING.ListingModel, {
    useValue: ListingModel,
  });

  container.register(TOKENS_LISTING.ListingRepository, {
    useClass: ListingRepository,
  });

container.register(TOKENS_LISTING.CreateListingUseCase, {
  useClass: CreateListingUseCase,
});

container.register(TOKENS_LISTING.GetListingUseCase, {
  useClass: GetListingUseCase,
});

container.register(TOKENS_LISTING.ListingCategoriesModel, {
  useValue: ListingCategoriesModel,
});

container.register(TOKENS_LISTING.ListingAmenityModel, {
  useValue: ListingAmenityModel,
});

container.register(TOKENS_LISTING.ListingLocationsModel, {
  useValue: ListingLocationsModel,
});

container.register(TOKENS_LISTING.ApplyDescriptionSuggestionUseCase, {
  useClass: ApplyDescriptionSuggestionUseCase,
});

container.register(TOKENS_LISTING.ApplyTitleSuggestionUseCase, {
  useClass: ApplyTitleSuggestionUseCase,
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

container.register(TOKENS_LISTING.Sequelize, {
  useValue: sequelize,
});



}