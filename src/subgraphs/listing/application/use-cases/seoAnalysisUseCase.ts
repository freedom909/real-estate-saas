// seoAnalysisUseCase.ts

import { SemanticContext } from "@/ai-platform/domain/semantic/semantic-context";
import { GenerateSEOKeywordsTool } from "@/ai-platform/application/capabilities/generateSEOKeywords.tool";
import { inject, injectable } from "tsyringe";
import { IListingRepository } from "../../domain/repos/IListingRepository";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { ListingAIContextFactory } from "../factories/listingAIContextFactory";

@injectable()
export class SEOAnalysisUseCase {

  constructor(
  @inject(TOKENS_LISTING.ListingRepository)
  private listingRepository:
    IListingRepository,

  private keywordTool:
    GenerateSEOKeywordsTool,

  private contextFactory:
    ListingAIContextFactory
  ) { }

  async execute(
    semantic: SemanticContext
  ) {

    const listingId =
      semantic.entities.find(
        e => e.type === "listing_id"
      )?.value;

    if (!listingId) {
      throw new Error(
        "listing id required"
      );
    }

    const listing =
      await this.listingRepository.findById(listingId);

    if (!listing) {
      throw new Error(
        "listing not found"
      );
    }


console.log(
  "STEP 2 listing",
  listing
);

const context =
  this.contextFactory.create(
    listing
  );

console.log(
  "STEP 3 context",
  context
);

    return this.keywordTool.execute(
      context
    );
  }
}