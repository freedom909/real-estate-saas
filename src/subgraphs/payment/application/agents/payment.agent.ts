// src/ai-platform/cognition/domain/agents/payment/payment.agent.ts
import { injectable } from "tsyringe";
import { SemanticContext } from "../../../../ai-platform/domain/semantic/semantic-context";
import { IDomainAgent } from "../../../../ai-platform/domain/agents/agent-router.service";

import { PaymentFacetResolver } from "../../../../ai-platform/domain/agents/payment/facets/payment-facet.resolver";

@injectable()
export class PaymentAgent implements IDomainAgent {
  constructor(
    private facetResolver: PaymentFacetResolver
  ) {}
  semantic: SemanticContext;

  async execute(task: Task): Promise<any> {
    return this.facetResolver.resolve(task.capability).execute(task.payload);
  }
}