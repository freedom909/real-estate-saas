// seoAnalysisUseCase.ts

import { SemanticContext } from "@/ai-platform/domain/semantic/semantic-context";
import { GenerateSEOKeywordsTool } from "@/ai-platform/application/capabilities/generateSEOKeywords.tool";
import { inject, injectable, delay } from "tsyringe";
import { IListingRepository } from "../../domain/repos/IListingRepository";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { ListingAIContextFactory } from "../factories/listingAIContextFactory";

@injectable()
export class SEOAnalysisUseCase {

  constructor(

  @inject(TOKENS_LISTING.repos.listingRepository)
  private listingRepository:
    IListingRepository,

  @inject(TOKENS_AI.tool.generateSEOKeywordsTool)
  private keywordTool:
    GenerateSEOKeywordsTool,

  @inject(delay(() => ListingAIContextFactory))
  private contextFactory:ListingAIContextFactory
  ) { }

  async execute(listingId: string) {

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