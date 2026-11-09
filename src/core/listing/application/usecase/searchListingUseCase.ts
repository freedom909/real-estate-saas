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

  async execute({
    locationId,
    locationIds,
    checkIn,
    checkOut,
    customerCount,
    minPrice,
    maxPrice,
    limit,
    offset,
  }: SearchListingsQuery) {
    // Search listings through repository
    const listings = await this.repo.search({
      locationId,
      locationIds,
      checkIn,
      checkOut,
      customerCount,
      minPrice,
      maxPrice,
      limit,
      offset,
    });

    console.log(
      "[SEARCH USECASE INPUT]",
      JSON.stringify(
        listings.map((listing) => ({
          id: listing.id,
          pictures: listing.pictures,
        })),
        null,
        2
      )
    );

    const result = {
      listings: listings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        pricePerNight: listing.pricePerNight,
        numOfBeds: listing.numOfBeds,
        numOfCustomers: listing.numOfCustomers,
        numOfBathrooms: listing.numOfBathrooms,
        numOfRooms: listing.numOfRooms,
        pictures: listing.pictures,
        isFeatured: listing.isFeatured,
      })),
      total: listings.length,
    };

    console.log(
      "[SEARCH USECASE OUTPUT]",
      result.listings.map((listing) => ({
        id: listing.id,
        pictureCount: listing.pictures?.length ?? 0,
        pictures: listing.pictures,
      }))
    );
   console.log(
  "[LISTING PRICE DEBUG]",
  listings.map((listing) => ({
    id: listing.id,
    title: listing.title,
    price: listing.pricePerNight,
    pricePerNight: listing.pricePerNight,
    // nightlyRate: listing.nightlyRate,
  }))
);
    return result;
  }
}
