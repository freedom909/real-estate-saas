// src/core/listing/application/usecase/searchListingUseCase.ts
import { inject, injectable } from "tsyringe";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { IListingRepository, SearchListingsQuery } from "../../domain/entities/IListingRepository";

@injectable()
export class SearchListingUseCase {

  constructor(
    @inject(TOKENS_LISTING.repos.listingRepository)
    private readonly repo: IListingRepository
  ) {}

  async execute({location,checkIn,checkOut,guestCount}: SearchListingsQuery) {
    
    const listings = await this.repo.search({location,checkIn,checkOut,guestCount});
  console.log(
    "🔍 SEARCH PARAMS",
    JSON.stringify({location,checkIn,checkOut,guestCount}, null, 2)
  );
  console.log(
    "🔍 SEARCH RESULTS",
    JSON.stringify(listings, null, 2)
  );
    
    return {
      listings: listings.map(l => ({
        id: l.id,
        title: l.title,
        description: l.description,
        address: l.address,
        price: l.price,
        numOfBeds: l.numOfBeds,
        numOfGuests: l.numOfGuests,
        numOfBathrooms: l.numOfBathrooms,
        numOfRooms: l.numOfRooms,
        picture: l.picture,
        isFeatured: l.isFeatured,
      })),
      total: listings.length,
    };
  }
}
