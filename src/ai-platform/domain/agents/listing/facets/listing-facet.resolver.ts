// src/ai-platform/domain/agents/listing/facets/listing-facet.resolver.ts
import { inject, injectable } from "tsyringe";
import { IExecutor, IFacetResolver } from "../../../planning/types/i-facet.resolver";
import { OptimizeContentExecutor } from "../../../semantic/extractors/optimize-content.executor";
import { GenerateContentExecutor } from "../../../semantic/extractors/generate-content.executor";
import { CapabilityType } from "../../../planning/types/enums";
import { TOKENS_LISTING_FACET_RESOLVERS } from "@/ai-platform/container/tokens/facet/listing.facet";

import { TOKENS_FACET_RESOLVERS }
from "@/ai-platform/container/tokens/facet/facet.resolver";

@injectable()
export class ListingFacetResolver {

  constructor(

    @inject(
      TOKENS_LISTING_FACET_RESOLVERS.optimizeContentExecutor
    )
    private optimizeContentExecutor:
      OptimizeContentExecutor,

    @inject(
      TOKENS_LISTING_FACET_RESOLVERS.generateContentExecutor
    )
    private generateContentExecutor:
      GenerateContentExecutor

  ) {}

  resolve(capability: string) {

    console.log(
      "ListingFacetResolver.resolve",
      capability
    );

    switch (capability) {

      case "OPTIMIZE_TITLE":
      case "OPTIMIZE_DESCRIPTION":
        return this
          .optimizeContentExecutor;

      case "GENERATE_TITLE":
      case "GENERATE_DESCRIPTION":
        return this
          .generateContentExecutor;

      default:
        throw new Error(
          `Unsupported capability: ${capability}`
        );
    }
  }
}