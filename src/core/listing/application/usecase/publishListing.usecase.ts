// src/core/listing/application/usecase/publishListing.usecase.ts


import { inject, injectable } from "tsyringe";

import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { IListingRepository } from "../../domain/entities/IListingRepository";
import { Listing } from "../../domain/entities/listing";

@injectable()
export class PublishListingUseCase {
  constructor(
    @inject(TOKENS_LISTING.repos.listingRepository)
    private readonly listingRepository: IListingRepository,
  ) {}

  async execute(listingId: string): Promise<Listing> {
    const listing = await this.listingRepository.findById(listingId);

    if (!listing) {
      throw new Error("Listing not found");
    }

    listing.publish();

    const updated = await this.listingRepository.update(
      listingId,
      listing,
    );

    if (!updated) {
      throw new Error("Failed to publish listing");
    }

    return listing;
  }
}
