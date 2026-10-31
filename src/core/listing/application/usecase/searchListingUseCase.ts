// src/core/listing/application/usecase/searchListingUseCase.ts
import { inject, injectable } from "tsyringe";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { IListingRepository, SearchListingsQuery } from "../../domain/entities/IListingRepository";

@injectable()
export class SearchListingUseCase {

  constructor(
    @inject(TOKENS_LISTING.repos.listingRepository)
    private readonly repo: IListingRepository
  ) { }

  async execute({ locationId, checkIn, checkOut, customerCount, minPrice, maxPrice }: SearchListingsQuery) {

    const listings = await this.repo.search({ locationId, checkIn, checkOut, customerCount, minPrice, maxPrice });

    console.log(
      "[SEARCH USECASE INPUT]",
      JSON.stringify(
        listings.map(l => ({
          id: l.id,
          pictures: l.pictures,
        })),
        null,
        2
      )
    );

    const result = {
      listings: listings.map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        pricePerNight: l.pricePerNight,
        numOfBeds: l.numOfBeds,
        numOfCustomers: l.numOfCustomers,
        numOfBathrooms: l.numOfBathrooms,
        numOfRooms: l.numOfRooms,
        pictures: l.pictures,
        isFeatured: l.isFeatured,
      })),
      total: listings.length,
    };

    console.log(
      "[SEARCH USECASE OUTPUT]",
      result.listings.map((l) => ({
        id: l.id,
        pictureCount: l.pictures?.length,
        pictures: l.pictures,
      }))
    );

    return result;


  }
}
