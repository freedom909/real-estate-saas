// src/ai-platform/cognition/domain/agents/listing/listing.agent.ts
import { inject, injectable } from "tsyringe";


import { ListingFacetResolver } from "./facets/listing-facet.resolver";
import { IDomainAgent } from "../../planning/types/i-domain.agent";
import { Task } from "../../planning/planners/task";
import { TOKENS_FACET_RESOLVERS } from "@/ai-platform/container/tokens/facet/facet.resolver";
import { SemanticContext } from "../../semantic/semantic-context";
import { CapabilityType } from "../../planning/types/enums";

@injectable()
export class ListingAgent
implements IDomainAgent {

   constructor(
    @inject(
      TOKENS_FACET_RESOLVERS
        .listingFacetResolver
    )
    private facetResolver:
      ListingFacetResolver
  ) {}

  async execute(
    semantic: SemanticContext
  ): Promise<any> {

    console.log(
      "ListingAgent.execute"
    );

    const capability =
      semantic.intents?.[0]?.name;

    console.log(
      "capability",
      capability
    );

    if (!capability) {
      return {
        reply:
          "No capability found."
      };
    }

    const executor =
      this.facetResolver
        .resolve(capability);

    console.log(
      "executor",
      executor
    );

    return await executor.execute(
      semantic
    );
  }
}