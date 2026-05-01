import { inject, injectable } from "tsyringe";
import { ListingRepository } from "../../infrastructure/persistence/listing.repository";
import { OpenAIAdapter } from "../../infrastructure/ai/OpenAI.adapter";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";

@injectable()
export class ApplyDescriptionSuggestionUseCase {
  constructor(
    @inject(TOKENS_LISTING.ListingRepository)
    private repo: ListingRepository,
    @inject(TOKENS_LISTING.OpenAIAdapter)
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

    const newDesc = await this.ai.generateText({ prompt });

    listing.applySuggestedDescription(newDesc);

    await this.repo.save(listing);

    return {
      listingId,
      description: listing.description,
    };
  }
}