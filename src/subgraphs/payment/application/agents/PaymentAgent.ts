import { inject, injectable } from "tsyringe";
import { SemanticContext } from "@/ai-platform/domain/semantic/semantic-context";
import { IDomainAgent } from "@/ai-platform/domain/planning/types/i-domain.agent";
import { PaymentFacetResolver } from "@/ai-platform/domain/agents/payment/facets/payment-facet.resolver";
import { TOKENS_FACET_RESOLVERS } from "@/ai-platform/container/tokens/facet/facet.resolver";

@injectable()
export class PaymentAgent implements IDomainAgent {
  constructor(
    @inject(TOKENS_FACET_RESOLVERS.paymentFacetResolver)
    private facetResolver: PaymentFacetResolver
  ) {}

  /**
   * Executes payment-specific AI tasks by resolving the appropriate executor.
   */
  async execute(semantic: SemanticContext): Promise<any> {
    const intent = semantic.intents[0]?.name;
    if (!intent) {
      throw new Error("No intent provided for PaymentAgent");
    }
    return this.facetResolver.resolve(intent).execute(semantic);
  }
}