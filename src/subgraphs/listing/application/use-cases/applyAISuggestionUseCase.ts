// applyAISuggestionUseCase.ts


import { inject, injectable } from "tsyringe";
import { ListingRepository } from "../../infrastructure/persistence/listing.repository";

import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { IListingAISuggestionRepository } from "../../domain/repos/IListingAISuggestionRepository";

@injectable()
export class ApplyAISuggestionUseCase {
  constructor(
    @inject(TOKENS_LISTING.repos.listingRepository)
    private listingRepo: ListingRepository,
    @inject(TOKENS_AI.repos.listingAISuggestionRepository)
    private aiSuggestionRepo:
      IListingAISuggestionRepository,

  ) {}

  async execute(suggestionId: string) {

  // 1️⃣ load suggestion
  const suggestion =
    await this.aiSuggestionRepo.findById(
      suggestionId
    );

  if (!suggestion) {
    throw new Error(
      "Suggestion not found"
    );
  }

  // 2️⃣ load listing
  const listing =
    await this.listingRepo.findById(
      suggestion.listingId
    );

  if (!listing) {
    throw new Error(
      "Listing not found"
    );
  }

  // 3️⃣ apply by type
  if (suggestion.type === "TITLE") {

    listing.applySuggestedTitle(
      suggestion.suggestion
    );

  } else if (
    suggestion.type === "DESCRIPTION"
  ) {

    listing.applySuggestedDescription(
      suggestion.suggestion
    );
  }

  // 4️⃣ save listing
  await this.listingRepo.save(listing);

  return listing;
}
}

 