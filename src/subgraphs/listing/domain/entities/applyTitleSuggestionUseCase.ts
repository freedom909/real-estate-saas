import { injectable, inject } from "tsyringe";

import { IListingRepository } from "./IListingRepository";
import { OpenAIAdapter } from "./openAIAdapter";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";


@injectable()
export class ApplyTitleSuggestionUseCase {
  // Prompt template colocated with the use case
  private readonly PROMPT_TEMPLATE = `
    You are an expert real estate listing title generator.
    Given the following listing details, suggest a concise and appealing new title.
    Current Title: "{currentTitle}"
    Current Description: "{currentDescription}"
    Suggest only the new title, nothing else.
  `;

  constructor(
    @inject(TOKENS_LISTING.ListingRepository)
    private listingRepository: IListingRepository,
    @inject(OpenAIAdapter)
    private openAIAdapter: OpenAIAdapter
  ) {}

  async execute(listingId: string): Promise<string> {
    const listing = await this.listingRepository.findById(listingId);
    if (!listing) {
      throw new Error(`Listing with ID ${listingId} not found.`);
    }

    const prompt = this.PROMPT_TEMPLATE
      .replace("{currentTitle}", listing.title)
      .replace("{currentDescription}", listing.description);

    return this.openAIAdapter.generateText({prompt});
  }
}