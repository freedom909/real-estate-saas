import { inject, injectable, delay } from "tsyringe";

import { IDomainAgent }
  from "../../semantic/types/IDomainAgent";

import { EntityType, SemanticContext }
  from "../../semantic/semantic-context";

import {
  TOKENS_LISTING
} from "@/modules/tokens/listing.tokens";

import { AIContext } from "@/ai-platform/context/types/context/ai.context";
import { GenerateListingAIOptimizationUseCase } from "@/ai-platform/application/usecases/listing/generateListingAIOptimization.usecase";

@injectable()
export class ListingAgent implements IDomainAgent {

  constructor(
    @inject(delay(() => GenerateListingAIOptimizationUseCase))
    private readonly optimizationUseCase: GenerateListingAIOptimizationUseCase,
  ) { }

  async execute(
    semantic: SemanticContext,
    context: AIContext
  ) {

    console.log(
      "📌 ListingAgent",
      semantic.action.type
    );
    
    let listingId =
      semantic.entities.find(
        e =>
          e.type === EntityType.LISTING_ID
      )?.value;

    // If listingId not found in semantic entities, try context resources
    if (!listingId && context.resources?.listingId) {
      listingId = context.resources.listingId;
    }

    if (!listingId) {
      throw new Error(
        "Listing ID not found in semantic context or AI context resources."
      );
    }
    const action = semantic.action?.type;

    switch (action) {

      case "OPTIMIZE_TITLE":
      case "OPTIMIZE_DESCRIPTION":

        return await this.optimizationUseCase.execute(listingId);

      default:
        throw new Error(
          `Unsupported action: ${action}`
        );
    }
  }
}