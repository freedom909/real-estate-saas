// src/ai-platform/cognition/domain/agents/listing/listing.agent.ts
import { inject, injectable } from "tsyringe";


import { ListingFacetResolver } from "./facets/listing-facet.resolver";
import { IDomainAgent } from "../../planning/types/i-domain.agent";
import { Task } from "../../planning/planners/task";
import { TOKENS_FACET_RESOLVERS } from "@/ai-platform/container/tokens/facet/facet.resolver";
import { SemanticContext } from "../../semantic/semantic-context";
import { CapabilityType } from "../../planning/types/enums";

@injectable()
export class ListingAgent implements IDomainAgent {

  constructor(
    @inject(TOKENS_FACET_RESOLVERS.listingFacetResolver)
    private facetResolver:ListingFacetResolver
  ) {}
  semantic: SemanticContext;

  async execute(
    semantic: SemanticContext
  ): Promise<any> {

    console.log(
      "ListingAgent.execute"
    );

    if (
      semantic.hasIntent(
        "OPTIMIZE_TITLE"
      )
    ) {

      console.log(
        "route optimize"
      );

      const executor =
        this.facetResolver.resolve(
          CapabilityType.OPTIMIZE_CONTENT
        );

      return executor.execute(
        semantic
      );
    }

    return {
      reply:
        "Listing intent not supported."
    };
  }
}