// GenerateSEOKeywordsTool.ts

import { ListingAIContext } from "@/subgraphs/ai/domain/entities/contexts/ListingAIContext";

export class GenerateSEOKeywordsTool {

  async execute(context: ListingAIContext) {

    return [
      "luxury apartment",
      "airbnb osaka",
      "family stay",
    ];
  }
}