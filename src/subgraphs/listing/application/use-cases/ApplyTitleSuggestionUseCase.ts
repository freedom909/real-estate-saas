// FILE: application/usecases/ApplyTitleSuggestionUseCase.ts
import { inject, injectable } from "tsyringe";
import { ListingRepository } from "../../infrastructure/persistence/listing.repository";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { IOpenAIAdapter } from "../../adapters/IOpenAIAdapter";
import { ListingDTOMapper } from "../../infrastructure/mappers/listingDTOMapper";
import { ListingAISuggestion } from "../../domain/entities/listingAISuggestion";
import { v4 as uuidv4 } from 'uuid';
import { IListingAISuggestionRepository } from "../../domain/repos/IListingAISuggestionRepository";
import { SuggestionStatus } from "../../domain/entities/suggestionStatus";


@injectable()
export class ApplyTitleSuggestionUseCase {
  constructor(
    @inject(TOKENS_LISTING.ListingRepository)
    private repo: ListingRepository,
    @inject(TOKENS_AI.OpenAIAdapter)
    private ai: IOpenAIAdapter,
    @inject(TOKENS_AI.ListingAISuggestionRepository)
    private aiSuggestionRepo: IListingAISuggestionRepository,
  ) { }

  async execute(listingId: string) {

    const listing = await this.repo.findById(listingId);
    if (!listing) throw new Error("Listing not found");

    // 🔥 Domain 生成 prompt
    const prompt = listing.generateTitlePrompt();

    // Fix: Pass prompt as a string
    const rawSuggestion =
      await this.ai.generateText({ prompt });

    const suggestion =
      rawSuggestion.replace(/^["']|["']$/g, "").trim();

    // Defensive Check: Ensure AI response meets domain requirements (Title requires 5 chars)
    if (!suggestion || suggestion.trim().length < 5) {
      throw new Error("AI generated a title that was too short.");
    }

    // 🔥 Domain 应用结果
    listing.applySuggestedTitle(suggestion);
    await this.aiSuggestionRepo.save(
      new ListingAISuggestion({
        id: uuidv4(),

        listingId,

        type: "TITLE",

        prompt,

        suggestion,

        model: "gpt-4.1-mini",
        status: SuggestionStatus.PENDING,

        createdAt: new Date(),
      })
    );
    await this.repo.save(listing);

    return ListingDTOMapper.toDTO(listing);
  }
}


