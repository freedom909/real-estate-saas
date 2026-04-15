import { container } from "tsyringe";
import { LISTING_TOKENS } from "./tokens";
import { ListingRepository } from "../infrastructure/persistence/ListingRepository";
import { OpenAIAdapter } from "../infrastructure/adapters/OpenAIAdapter";
import { GenerateTitleSuggestionUseCase } from "../application/usecases/GenerateTitleSuggestionUseCase";
import { GenerateDescriptionSuggestionUseCase } from "../application/usecases/GenerateDescriptionSuggestionUseCase";

export function registerListingDependencies() {
  container.register(LISTING_TOKENS.ListingRepository, {
    useClass: ListingRepository,
  });

  container.register(OpenAIAdapter, { useClass: OpenAIAdapter });
  container.register(GenerateTitleSuggestionUseCase, { useClass: GenerateTitleSuggestionUseCase });
  container.register(GenerateDescriptionSuggestionUseCase, { useClass: GenerateDescriptionSuggestionUseCase });
}