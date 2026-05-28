// FILE: application/usecases/ApplyTitleSuggestionUseCase.ts
import { inject, injectable } from "tsyringe";
import { OpenAIAdapter } from "../../infrastructure/ai/OpenAI.adapter";
import { ListingRepository } from "../../infrastructure/persistence/listing.repository";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";


@injectable()
export class ApplyTitleSuggestionUseCase {
  constructor(
    @inject(TOKENS_LISTING.ListingRepository)
    private repo: ListingRepository,
    @inject(TOKENS_LISTING.OpenAIAdapter)
    private ai: OpenAIAdapter
  ) {}

  async execute(listingId: string) {
    const listing = await this.repo.findById(listingId);
    if (!listing) throw new Error("Listing not found");

    // 🔥 Domain 生成 prompt
    const prompt = listing.generateTitlePrompt();

    // Fix: Pass prompt as a string
    const suggestion = await this.ai.generateText(prompt);

    // Defensive Check: Ensure AI response meets domain requirements (Title requires 5 chars)
    if (!suggestion || suggestion.trim().length < 5) {
      throw new Error("AI generated a title that was too short.");
    }

    // 🔥 Domain 应用结果
    listing.applySuggestedTitle(suggestion);

    await this.repo.save(listing);

    return {
      listingId,
      title: listing.title,
    };
  }
}