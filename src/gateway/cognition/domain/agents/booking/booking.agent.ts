// src/gateway/cognition/domain/agents/booking/booking.agent.ts
import { injectable } from "tsyringe";
import { Task } from "../../planning/entities/task.domain";
import { IDomainAgent } from "../types/i-domain.agent";
import { BookingFacetResolver } from "./facets/booking-facet.resolver";

@injectable()
export class BookingAgent implements IDomainAgent {
  constructor(
    private facetResolver: BookingFacetResolver
  ) {}

  async execute(task: Task): Promise<any> {
    return this.facetResolver.resolve(task.capability).execute(task.payload);
  }
}