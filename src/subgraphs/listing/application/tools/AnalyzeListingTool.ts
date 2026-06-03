import { injectable } from "tsyringe";
// Note: ListingAIContext should also move to the listing subgraph
import { ListingAIContext } from "@/subgraphs/listing/domain/entities/contexts/ListingAIContext";

@injectable()
export class AnalyzeListingTool {
  /**
   * Analyzes listing content for quality and SEO problems.
   */
  async execute(context: ListingAIContext) {
    // Production implementation would use the OpenAIAdapter or a domain service here
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