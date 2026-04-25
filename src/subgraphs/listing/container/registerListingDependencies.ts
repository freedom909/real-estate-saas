import { container } from "tsyringe";
import { LISTING_TOKENS } from "./tokens";
import { OpenAIAdapter } from "../domain/entities/OpenAIAdapter";
import { ListingRepository } from "../infrastructure/persistence/listing.repository";
import { GenerateTitleSuggestionUseCase } from "../application/use-cases/GenerateTitleSuggestionUseCase";
import { GenerateDescriptionSuggestionUseCase } from "../domain/entities/GenerateDescriptionSuggestionUseCase";


export function registerListingDependencies() {
  container.register(LISTING_TOKENS.ListingRepository, {
    useClass: ListingRepository,
  });

  container.register(OpenAIAdapter, { useClass: OpenAIAdapter });
  container.register(GenerateTitleSuggestionUseCase, { useClass: GenerateTitleSuggestionUseCase });
  container.register(GenerateDescriptionSuggestionUseCase, { useClass: GenerateDescriptionSuggestionUseCase });
}