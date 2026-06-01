import { inject, injectable } from "tsyringe";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { PaymentACL } from "../../domain/entities/contexts/PaymentACL";
import { PaymentRiskAgent } from "../agents/payment/PaymentRiskAgent";

@injectable()
export class RunPaymentAgentUseCase {
  constructor(
    private acl: PaymentACL,
    @inject(TOKENS_AI.agent.paymentRiskAgent)
    private agent: PaymentRiskAgent
  ) {}

  async execute(transactionId: string) {
    const context = await this.acl.getContext(transactionId);
    return this.agent.execute(context);
  }
}