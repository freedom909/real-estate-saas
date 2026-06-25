// GenerateSEOKeywordsTool.ts

import { ListingAIContext } from "@/core/listing/domain/entities/listingAI.context";



export class GenerateSEOKeywordsTool {

  async execute(context: ListingAIContext) {

    return [
      "luxury apartment",
      "airbnb osaka",
      "family stay",
    ];
  }
}