import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { container } from "tsyringe";
import ListingModel from "../infrastructure/models/listing.model";
import ListingAmenityModel from "../infrastructure/models/listingAmenities.model";

import { ListingRepository } from "../infrastructure/persistence/listing.repository";
import CreateListingUseCase from "../application/use-cases/CreateListingUseCase";
import { GenerateTitleSuggestionUseCase } from "../application/use-cases/GenerateTitleSuggestionUseCase";
import { OpenAIAdapter } from "../infrastructure/ai/OpenAI.adapter";
import { GenerateDescriptionSuggestionUseCase } from "../domain/entities/GenerateDescriptionSuggestionUseCase";
import ListingCategoriesModel from "../infrastructure/models/listingCategories.model";
import { sequelize } from "@/infrastructure/config/seq";

export function registerListingDependencies() {

  // DB
  container.register(TOKENS_LISTING.ListingModel, {
    useValue: ListingModel,
  });

  container.register(TOKENS_LISTING.ListingCategoriesModel, {
    useValue: ListingCategoriesModel,
  });

  container.register(TOKENS_LISTING.ListingAmenityModel, {
    useValue: ListingAmenityModel,
  });

  container.register(TOKENS_LISTING.Sequelize, {
    useValue: sequelize,
  });

  // Repo
  container.register(TOKENS_LISTING.ListingRepository, {
    useClass: ListingRepository,
  });

  // UseCases
  container.register(TOKENS_LISTING.CreateListingUseCase, {
    useClass: CreateListingUseCase,
  });

  container.register(TOKENS_LISTING.GenerateTitleSuggestionUseCase, {
    useClass: GenerateTitleSuggestionUseCase,
  });

  container.register(TOKENS_LISTING.GenerateDescriptionSuggestionUseCase, {
    useClass: GenerateDescriptionSuggestionUseCase,
  });

  // AI
  container.register(TOKENS_LISTING.OpenAIAdapter, {
    useClass: OpenAIAdapter,
  });
}