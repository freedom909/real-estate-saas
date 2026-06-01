// FILE: src/subgraphs/listing/container/index.ts

import { container } from 'tsyringe';
import { TOKENS_LISTING } from '@/modules/tokens/listing.tokens';
import ListingModel from '../../subgraphs/listing/infrastructure/models/listing.model';
import {ListingRepository} from '../../subgraphs/listing/infrastructure/persistence/listing.repository';
import CreateListingUseCase from '../../subgraphs/listing/application/use-cases/createListingUseCase';

import ListingAmenityModel from '@/subgraphs/listing/infrastructure/models/listingAmenities.model';
import ListingCategoriesModel from '@/subgraphs/listing/infrastructure/models/listingCategories.model';
import ListingLocationsModel from '@/subgraphs/listing/infrastructure/models/listingLocations.model';

import AmenityAdapter from '@/subgraphs/listing/adapters/amenity.adapter';
import { CategoryAdapter } from '@/subgraphs/listing/adapters/category.adapter';
import { sequelize } from '@/infrastructure/config/seq';
import GetListingUseCase from '@/subgraphs/listing/application/use-cases/getListingUseCase';
import { ApplyDescriptionSuggestionUseCase } from '@/subgraphs/listing/domain/entities/applyDescriptionSuggestionUseCase';
import { ApplyTitleSuggestionUseCase } from '@/subgraphs/listing/domain/entities/applyTitleSuggestionUseCase';





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

container.register("ApplyDescriptionSuggestionUseCase", {
  useClass: ApplyDescriptionSuggestionUseCase,
});

container.register("ApplyTitleSuggestionUseCase", {
  useClass: ApplyTitleSuggestionUseCase,
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