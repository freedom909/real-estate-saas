// FILE: application/usecases/ApplyDescriptionSuggestionUseCase.ts

import { inject, injectable } from "tsyringe";
import { IListingRepository } from "../../domain/repos/IListingRepository";
import { GenerateDescriptionSuggestionUseCase } from "../../domain/entities/GenerateDescriptionSuggestionUseCase";


@injectable()
export class ApplyDescriptionSuggestionUseCase {
  constructor(
    @inject("ListingRepository") private repo: IListingRepository,
    private generate: GenerateDescriptionSuggestionUseCase
  ) {}

  async execute(listingId: string) {
    const listing = await this.repo.findById(listingId);
    if (!listing) throw new Error("Listing not found");

    const suggestion = await this.generate.execute(listingId);

    listing.applySuggestedDescription(suggestion);

    await this.repo.save(listing);

    return {
      listingId,
      description: listing.description,
    };
  }
}