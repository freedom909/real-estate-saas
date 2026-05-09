import { inject, injectable } from "tsyringe";
import { ListingRepository } from "../../infrastructure/persistence/listing.repository";

import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { IOpenAIAdapter } from "../../domain/entities/IOpenAIAdapter";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";

@injectable()
export class ApplyDescriptionSuggestionUseCase {
  constructor(
    @inject(TOKENS_LISTING.ListingRepository)
    private repo: ListingRepository,
    @inject(TOKENS_AI.OpenAIAdapter)
    private ai: IOpenAIAdapter,
  ) { }

  async execute(listingId: string) {
    const listing = await this.repo.findById(listingId);
    if (!listing) throw new Error("Listing not found");

    const prompt = `
Improve this listing description:

Title: ${listing.title}
Description: ${listing.description}
`;

    // Fix: Pass prompt as a string, not an object
    const newDesc = await this.ai.generateText({ prompt });
    console.log(newDesc); //no output in the terminal

    // Defensive Check: Ensure AI response meets domain requirements
    if (!newDesc || newDesc.trim().length < 10) {
      throw new Error("AI generated a description that was too short. Please try again.");
    }

    listing.applySuggestedDescription(newDesc);
    await this.repo.save(listing);

    return {
      listingId,
      description: listing.description,
    };
  }
}