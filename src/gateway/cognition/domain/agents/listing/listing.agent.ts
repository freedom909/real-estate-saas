// src/gateway/cognition/domain/agents/listing/listing.agent.ts
import { injectable } from "tsyringe";
import { Task } from "../../planning/entities/task.domain";
import { IDomainAgent } from "../types/i-domain.agent";
import { ListingFacetResolver } from "./facets/listing-facet.resolver";

@injectable()
export class ListingAgent implements IDomainAgent {
  constructor(
    private facetResolver: ListingFacetResolver
  ) {}

  async execute(task: Task): Promise<any> {
    return this.facetResolver.resolve(task.capability).execute(task.payload);
  }
}