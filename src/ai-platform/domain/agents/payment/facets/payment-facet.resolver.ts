// src/ai-platform/cognition/domain/agents/payment/facets/payment-facet.resolver.ts
import { injectable } from "tsyringe";
import { IFacetResolver } from "../../../planning/types/i-facet.resolver";
import { IExecutor } from "../../../planning/types/i-facet.resolver";

import { CapabilityType } from "../../../planning/types/enums";
import { RefundPaymentExecutor } from "../../../semantic/extractors/refund-payment.executor";


@injectable()
export class PaymentFacetResolver implements IFacetResolver {
  constructor(
    private refundPaymentExecutor: RefundPaymentExecutor
  ) {}

  resolve(capability: CapabilityType): IExecutor {
    switch (capability) {
      case CapabilityType.REFUND_PAYMENT: return this.refundPaymentExecutor;
      default: throw new Error(`No executor found for Payment capability: ${capability}`);
    }
  }
}