import { injectable, inject } from "tsyringe";

import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { v4 as uuidv4 } from 'uuid';
import { ListingRepository } from "../../infrastructure/persistence/listing.repository";
import { IOpenAIAdapter } from "../../adapters/IOpenAIAdapter";
import { IListingAISuggestionRepository } from "../../domain/repos/IListingAISuggestionRepository";
import { ListingAISuggestion } from "../../domain/entities/listingAISuggestion";
import { SuggestionStatus } from "../../domain/entities/suggestionStatus";
import { ListingAISuggestionMapper } from "../../infrastructure/mappers/listingAISuggestionMapper";

@injectable()
export class GenerateDescriptionSuggestionUseCase {

  constructor(
    @inject(TOKENS_LISTING.ListingRepository)
    private repo: ListingRepository,

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

    // 🔥 Use domain logic to generate the correct prompt
    const prompt = listing.generateDescriptionPrompt();

    const rawSuggestion =
      await this.ai.generateText({ prompt });

    const suggestion = (rawSuggestion || "").replace(/^.*:\s*/s, "").replace(/^["']|["']$/g, "").trim();

    if (!suggestion ||
      suggestion.trim().length < 10) {

      throw new Error(
        "AI generated description too short"
      );
    }

    // ONLY SAVE AI ARTIFACT

    const aiSuggestion =
      new ListingAISuggestion({
        id: uuidv4(),

        listingId,

        type: "DESCRIPTION",

        prompt,

        suggestion,

        status: SuggestionStatus.PENDING,

        model: "gpt-4.1-mini",

        createdAt: new Date(),
      });
    console.log(aiSuggestion);
    await this.aiSuggestionRepo.save(
      aiSuggestion
    );

    // 🔥 Return a POJO/DTO so GraphQL can serialize it correctly
    return ListingAISuggestionMapper.toPersistence(aiSuggestion);
  }
}