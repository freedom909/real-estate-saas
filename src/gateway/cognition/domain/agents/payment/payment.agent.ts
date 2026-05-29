// src/gateway/cognition/domain/agents/payment/payment.agent.ts
import { injectable } from "tsyringe";
import { Task } from "../../planning/entities/task.domain";
import { IDomainAgent } from "../types/i-domain.agent";
import { PaymentFacetResolver } from "./facets/payment-facet.resolver";

@injectable()
export class PaymentAgent implements IDomainAgent {
  constructor(
    private facetResolver: PaymentFacetResolver
  ) {}

  async execute(task: Task): Promise<any> {
    return this.facetResolver.resolve(task.capability).execute(task.payload);
  }
}