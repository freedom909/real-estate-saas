// RewriteDescriptionTool.ts

import { ListingAIContext } from "@/subgraphs/ai/domain/entities/contexts/ListingAIContext";

export class RewriteDescriptionTool {

  async execute(context: ListingAIContext) {

    return "Luxury apartment in Osaka, family stay, 2 bedrooms, 2 bathrooms, 1000 sq ft";
  }
}
