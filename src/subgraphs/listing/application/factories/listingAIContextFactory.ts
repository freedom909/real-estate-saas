// listingAIContextFactory.ts

import { injectable } from "tsyringe";
import { Listing } from "../../domain/entities/listing";
import { ListingAIContext } from "../../domain/entities/listingAIContext";

@injectable()
export class ListingAIContextFactory {

  create(listing: Listing): ListingAIContext {
console.log(
  "categories++",
  listing.categories
);

console.log(
  "amenities++",
  listing.amenityIds
);
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      categories: listing.categories,
      amenities: listing.amenityIds.map(amenityId => amenityId),
      price: listing.price,
      numOfBeds: listing.numOfBeds,
      numOfGuests: listing.numOfGuests,
      analysis: undefined,
      seoKeywords: []
    };
    
  }
}