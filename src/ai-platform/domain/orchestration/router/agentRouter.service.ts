// src/ai-platform/domain/orchestration/router/agentRouterService.ts
import { inject, injectable, delay } from "tsyringe";
import { IDomainAgent } from "../../semantic/types/IDomainAgent";
import { SemanticContext } from "../../semantic/semantic-context";
import { ListingAgent } from "../../agents/listing/listing.agent";
import { BookingAgent } from "../../agents/booking/booking.agent";

import { TOKENS_AGENT } from "@/ai-platform/container/tokens/agent/module.agent";
import { AIDomain } from "../../semantic/types/ai.domain";



@injectable()
export class AgentRouterService {

  constructor(
    @inject(delay(() => TOKENS_AGENT.listingAgent))
    private listingAgent: ListingAgent,
    @inject(delay(() => TOKENS_AGENT.bookingAgent))
    private bookingAgent: BookingAgent,
    // @inject(TOKENS_AGENT.paymentAgent)
    // private paymentAgent: PaymentAgent,
  ) {}

  route(
    semantic: SemanticContext
  ): IDomainAgent {

    switch (semantic.domain) {

      case AIDomain.LISTING:
        return this.listingAgent;

      case AIDomain.BOOKING:
        return this.bookingAgent;

      // case AIDomain.PAYMENT:
      //   return this.paymentAgent;

      default:
        throw new Error(
          `No agent for ${semantic.domain}`
        );
    }
  }
}