// src/ai-platform/cognition/domain/agents/booking/booking.agent.ts
import { injectable } from "tsyringe";

import { BookingFacetResolver } from "./facets/booking-facet.resolver";
import { SemanticContext } from "../../semantic/semantic-context";
import { IDomainAgent } from "../agent-router.service";

@injectable()
export class BookingAgent implements IDomainAgent {
  constructor(
    private facetResolver: BookingFacetResolver
  ) {}

  async execute(semantic: SemanticContext): Promise<any> {
    return await this.facetResolver.resolve(semantic.intents[0]?.name).execute(semantic);
  }
}