// AnalyzeListingTool.ts

import { ListingAIContext } from "@/subgraphs/ai/domain/entities/contexts/ListingAIContext";

export class AnalyzeListingTool {

  async execute(context: ListingAIContext) {

    return {
      score: 62,
      seoScore: 40,
      readability: 58,
      problems: [
        "title too short",
        "description lacks keywords",
      ],
    };
  }
}