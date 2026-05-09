import { injectable, inject } from "tsyringe";

import { OpenAIAdapter } from "./openAIAdapter";
import { ListingRepository } from "../../infrastructure/persistence/listing.repository";
import { IListingRepository } from "./IListingRepository";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";



@injectable()
export class ApplyDescriptionSuggestionUseCase {
  // Prompt template colocated with the use case
  private readonly PROMPT_TEMPLATE = `
    You are an expert real estate listing description writer.
    Given the following listing details, suggest an improved, detailed, and engaging new description.
    Current Title: "{currentTitle}"
    Current Description: "{currentDescription}"
    Suggest only the new description, nothing else.
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
      .replace("{currentTitle}", listing.title.getValue())
      .replace("{currentDescription}", listing.description.getValue());

    return this.openAIAdapter.generateText({prompt});
  }
}