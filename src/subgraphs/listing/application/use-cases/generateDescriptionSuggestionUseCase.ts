import { injectable, inject } from "tsyringe";
import { ILLMService } from "@/subgraphs/listing/application/ai/services/openAIService";
import { listingOptimizationPrompt } from "@/subgraphs/listing/application/ai/prompts/listing.prompt";
import { IListingRepository } from "../../domain/entities/IListingRepository";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { v4 as uuidv4 } from 'uuid';
import { ListingRepository } from "../../infrastructure/persistence/listing.repository";
import { IOpenAIAdapter } from "../../adapters/IOpenAIAdapter";
import { IListingAISuggestionRepository } from "../../domain/repos/IListingAISuggestionRepository";
import { ListingAISuggestion } from "../../domain/entities/listingAISuggestion";
import { GenerateDescriptionResult } from "../contracts/ai/generateDescriptionResult";

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

    const prompt = `
Improve this listing description:

Title: ${listing.title}
Description: ${listing.description}
`;

    const suggestion =
      await this.ai.generateText({ prompt });

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

        model: "gpt-4.1-mini",

        createdAt: new Date(),
      });
    console.log(aiSuggestion);
    await this.aiSuggestionRepo.save(
      aiSuggestion
    );

    return aiSuggestion;
  }
}