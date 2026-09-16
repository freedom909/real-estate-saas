// listingAIContextFactory.ts

import { injectable } from "tsyringe";
import { Listing } from "../../domain/entities/listing";
import { ListingAIContext } from "../../domain/entities/listingAI.context";

@injectable()
export class ListingAIContextFactory {
  create(listing: Listing): ListingAIContext {
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      categories: listing.categoryIds,
      amenities: listing.amenityIds,
      price: listing.pricePerNight,
      numOfBeds: listing.numOfBeds,
      numOfCustomers: listing.numOfCustomers,
      analysis: undefined,
      seoKeywords: []
    };   
  }
}