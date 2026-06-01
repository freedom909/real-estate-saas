// FILE: application/usecases/generateTitleSuggestionUseCase.ts

import { inject, injectable } from "tsyringe";
import { IListingRepository } from "../../domain/entities/IListingRepository";
import { IOpenAIAdapter } from "../../adapters/IOpenAIAdapter";
import { IListingAISuggestionRepository } from "../../domain/repos/IListingAISuggestionRepository";

import { v4 as uuidv4 } from 'uuid';

import { buildTitlePrompt } from "../prompts/buildTitlePrompt";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { ListingAISuggestion } from "../../domain/entities/listingAISuggestion";
import { SuggestionStatus } from "../../domain/entities/suggestionStatus";

@injectable()
export class GenerateTitleSuggestionUseCase {

  constructor(
    @inject(TOKENS_LISTING.ListingRepository)
    private repo: IListingRepository,

    @inject(TOKENS_AI.OpenAIAdapter)
    private ai: IOpenAIAdapter,
  ) {}

async execute(listingId: string) {

  console.log(
    "STEP 1 listingId",
    listingId
  );

  const listing =
    await this.repo.findById(
      listingId
    );

  console.log(
    "STEP 2 listing",
    listing
  );

  if (!listing) {
    throw new Error(
      "Listing not found"
    );
  }

  console.log(
    "STEP 3 build prompt"
  );

  const prompt = `
Improve this listing title:

Title:
${listing.title}

Description:
${listing.description}
`;

  console.log(
    "STEP 4 call AI"
  );

  const suggestion =
    await this.ai.generateText({
      prompt
    });

  console.log(
    "STEP 5 suggestion",
    suggestion
  );

  return suggestion;
}
}