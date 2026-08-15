// src/wisdom/reference/mappers/listing-search-result.mapper.ts

import { SearchListingResult } from "@/wisdom/contracts/ai-context";

export class ListingSearchResultMapper {
  static toWisdom(raw: any): SearchListingResult {
    return {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      address: raw.address,
      price: raw.price,
      numOfBeds: raw.numOfBeds,
      numOfCustomers: raw.numOfCustomers,
      numOfBathrooms: raw.numOfBathrooms,
      numOfRooms: raw.numOfRooms,

      // Wisdom only needs image references.
      picture: (raw.picture ?? []).map(
        (picture: any) =>
          picture.url ??
          picture.objectKey ??
          "",
      ),

      isFeatured: raw.isFeatured,
    };
  }

  static toWisdomList(raw: any[]): SearchListingResult[] {
    return raw.map(this.toWisdom);
  }
}