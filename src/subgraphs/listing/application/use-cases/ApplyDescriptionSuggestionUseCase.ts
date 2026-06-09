import { inject, injectable, delay } from "tsyringe";
import { ListingRepository } from "../../infrastructure/persistence/listing.repository";
import { OpenAIAdapter } from "../../infrastructure/ai/openAI.adapter";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";

@injectable()
export class ApplyDescriptionSuggestionUseCase {
  constructor(
    @inject(TOKENS_LISTING.repos.listingRepository)
    private repo: ListingRepository,
    @inject(TOKENS_LISTING.ai.openAIAdapter)
    private ai: OpenAIAdapter,
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
    const newDesc = await this.ai.generateText({prompt});

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