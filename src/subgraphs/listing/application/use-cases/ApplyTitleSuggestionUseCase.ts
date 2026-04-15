// FILE: application/usecases/ApplyTitleSuggestionUseCase.ts

import { inject, injectable } from "tsyringe";
import { IListingRepository } from "../../domain/repos/IListingRepository";
import { GenerateTitleSuggestionUseCase } from "./GenerateTitleSuggestionUseCase";

@injectable()
export class ApplyTitleSuggestionUseCase {
  constructor(
    @inject("ListingRepository") private repo: IListingRepository,
    private generate: GenerateTitleSuggestionUseCase
  ) {}

  async execute(listingId: string) {
    const listing = await this.repo.findById(listingId);
    if (!listing) throw new Error("Listing not found");

    const suggestion = await this.generate.execute(listingId);

    listing.applySuggestedTitle(suggestion);

    await this.repo.save(listing);

    return {
      listingId,
      title: listing.title,
    };
  }
}