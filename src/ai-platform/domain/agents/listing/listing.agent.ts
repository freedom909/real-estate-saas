// src/ai-platform/cognition/domain/agents/listing/listing.agent.ts
import { inject, injectable } from "tsyringe";


import { ListingFacetResolver } from "./facets/listing-facet.resolver";
import { IDomainAgent } from "../agent-router.service";
import { Task } from "../../planning/planners/task";
import { TOKENS_FACET_RESOLVERS } from "@/ai-platform/container/tokens/facet/facet.resolver";
import { SemanticContext } from "../../semantic/semantic-context";

@injectable()
export class ListingAgent implements IDomainAgent {
  semantic: SemanticContext;

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

    return {
      reply:
        semantic.rawInput
    };
  }
}