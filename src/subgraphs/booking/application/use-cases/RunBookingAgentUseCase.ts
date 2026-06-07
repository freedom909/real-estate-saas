import { inject, injectable } from "tsyringe";

import { BookingFraudAgent } from "../../BookingFraudAgent";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { BookingACL } from "../../domain/entities/contexts/bookingACL";

@injectable()
export class RunBookingAgentUseCase {
  constructor(
    private acl: BookingACL,
    @inject(TOKENS_AI.agent.bookingFraudAgent)
    private fraudAgent: BookingFraudAgent
  ) {}

  async execute(bookingId: string) {
    // 1. Resolve context via ACL (Anti-Corruption Layer)
    const context = await this.acl.getContext(bookingId);

    // 2. Orchestrate Agent
    return this.fraudAgent.execute(context);
  }
}