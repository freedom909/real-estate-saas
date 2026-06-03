// GenerateSEOKeywordsTool.ts

import { ListingAIContext } from "@/subgraphs/listing/domain/entities/listingAIContext";

export class GenerateSEOKeywordsTool {

  async execute(context: ListingAIContext) {

    return [
      "luxury apartment",
      "airbnb osaka",
      "family stay",
    ];
  }
}