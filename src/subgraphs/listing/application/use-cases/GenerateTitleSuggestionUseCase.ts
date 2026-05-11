// FILE: application/usecases/GenerateTitleSuggestionUseCase.ts

import { inject, injectable } from "tsyringe";
import { IListingRepository } from "../../domain/repos/IListingRepository";
import { IOpenAIAdapter } from "../../domain/entities/IOpenAIAdapter";
import { v4 as uuidv4 } from 'uuid';

import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { IListingAISuggestionRepository } from "../../domain/repos/IListingAISuggestionRepository";
import { ListingAISuggestion } from "../../domain/entities/listingAISuggestion";

@injectable()
export class GenerateTitleSuggestionUseCase {

  constructor(
    @inject(TOKENS_LISTING.ListingRepository)
    private repo: IListingRepository,

    @inject(TOKENS_AI.OpenAIAdapter)
    private ai: IOpenAIAdapter,

    @inject(TOKENS_AI.ListingAISuggestionRepository)
    private aiSuggestionRepo:
      IListingAISuggestionRepository
  ) {}

  async execute(listingId: string) {

    const listing =
      await this.repo.findById(listingId);

    if (!listing) {
      throw new Error("Listing not found");
    }

    const prompt = `
Improve this listing title:

Title: ${listing.title}
Description: ${listing.description}
`;

    const rawSuggestion =
      await this.ai.generateText({ prompt });

    const suggestion = (rawSuggestion || "").replace(/^["']|["']$/g, "").trim();

    if (!suggestion || suggestion.length < 10) {

      throw new Error(
        "AI generated title too short"
      );
    }

    // ONLY SAVE AI ARTIFACT

    const aiSuggestion =
      new ListingAISuggestion({
        id: uuidv4(),

        listingId,

        type: "TITLE",

        prompt,

        suggestion,

        model: "gpt-4.1-mini",
        createdAt: new Date(),
      });

    await this.aiSuggestionRepo.save(
      aiSuggestion
    );
    return aiSuggestion;
  }
}