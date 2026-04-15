// FILE: application/usecases/GenerateTitleSuggestionUseCase.ts

import { inject, injectable } from "tsyringe";
import { IListingRepository } from "../../domain/repositories/IListingRepository";
import { OpenAIAdapter } from "../../infrastructure/ai/OpenAI.adapter";
import { buildTitlePrompt } from "../prompts/buildTitlePrompt";

@injectable()
export class GenerateTitleSuggestionUseCase {
  constructor(
    @inject("ListingRepository") private repo: IListingRepository,
    private ai: OpenAIAdapter
  ) {}

  async execute(listingId: string): Promise<string> {
    const listing = await this.repo.findById(listingId);
    if (!listing) throw new Error("Listing not found");

    const prompt = buildTitlePrompt(listing);

    return this.ai.generateText({ prompt });
  }
}