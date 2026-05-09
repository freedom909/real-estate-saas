// FILE: application/usecases/GenerateTitleSuggestionUseCase.ts

import { inject, injectable } from "tsyringe";
import { IListingRepository } from "../../domain/entities/IListingRepository";
import { IOpenAIAdapter } from "../../domain/entities/IOpenAIAdapter";

import { buildTitlePrompt } from "../prompts/buildTitlePrompt";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";

@injectable()
export class GenerateTitleSuggestionUseCase {
  constructor(
    @inject(TOKENS_LISTING.ListingRepository) private repo: IListingRepository,
    @inject(TOKENS_AI.OpenAIAdapter) private ai: IOpenAIAdapter
  ) {}

  async execute(listingId: string): Promise<string> {
    const listing = await this.repo.findById(listingId);
    if (!listing) throw new Error("Listing not found");

    const prompt = buildTitlePrompt(listing);

    return this.ai.generateText({prompt});
  }
}