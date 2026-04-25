// FILE: application/usecases/ApplyTitleSuggestionUseCase.ts
import { injectable } from "tsyringe";
import { OpenAIAdapter } from "../../infrastructure/ai/OpenAI.adapter";
import { ListingRepository } from "../../infrastructure/persistence/listing.repository";


@injectable()
export class ApplyTitleSuggestionUseCase {
  constructor(
    private repo: ListingRepository,
    private ai: OpenAIAdapter
  ) {}

  async execute(listingId: string) {
    const listing = await this.repo.findById(listingId);
    if (!listing) throw new Error("Listing not found");

    // 🔥 Domain 生成 prompt
    const prompt = listing.generateTitlePrompt();

    const suggestion = await this.ai.generateText({ prompt });

    // 🔥 Domain 应用结果
    listing.applySuggestedTitle(suggestion);

    await this.repo.save(listing);

    return {
      listingId,
      title: listing.title,
    };
  }
}