// src/ai-platform/domain/orchestration/router/agentRouterService.ts
import { inject, injectable } from "tsyringe";
import { IDomainAgent } from "../../semantic/types/IDomainAgent";
import { SemanticContext } from "../../semantic/semantic-context";
import { ListingAgent } from "../../agents/listing/listing.agent";
import { BookingAgent } from "../../agents/booking/booking.agent";
import { GeneralAgent } from "../../agents/general.agent";

import { TOKENS_AGENT } from "@/ai-platform/container/agents/agent.token";
import { AIDomain } from "../../semantic/types/ai.domain";

@injectable()
export class AgentRouterService {

  constructor(
    @inject(TOKENS_AGENT.listingAgent)
    private listingAgent: ListingAgent,
    @inject(TOKENS_AGENT.bookingAgent)
    private bookingAgent: BookingAgent,
    @inject(TOKENS_AGENT.generalAgent)
    private generalAgent: GeneralAgent,
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

      case AIDomain.GENERAL:
      case AIDomain.REVIEW:
      case AIDomain.UNKNOWN:
      default:
        return this.generalAgent;
    }
  }
}
