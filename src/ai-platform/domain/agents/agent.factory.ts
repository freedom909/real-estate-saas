//

import { inject, injectable } from "tsyringe";

import { BookingAgent } from "./booking/booking.agent";
import { GeneralAgent } from "./generalAgent";
import { ListingAgent } from "./listing/listing.agent";
// import { PaymentAgent } from "./payment/payment.agent";
import { TOKENS_AGENT } from "@/ai-platform/container/tokens/agent/module.agent";
import { IDomainAgent } from "../semantic/types/IDomainAgent";

@injectable()
export class AgentFactory {
    
  constructor(
    @inject(TOKENS_AGENT.listingAgent)
    private listingAgent: ListingAgent,
    // @inject(TOKENS_AGENT.bookingAgent)
    // private bookingAgent: BookingAgent,
    // @inject(TOKENS_AGENT.paymentAgent)
    // private paymentAgent: PaymentAgent,
     @inject(TOKENS_AGENT.generalAgent)
    private generalAgent: GeneralAgent,
    // private securityAgent: SecurityAgent
  ) {}

  resolve(agentName: string): IDomainAgent {
    switch (agentName) {
      case "ListingAgent":
        return this.listingAgent;
      //case "BookingAgent":
    //     return this.bookingAgent;
    //   case "PaymentAgent":
    //     return this.paymentAgent;
    //   case "SecurityAgent":
    //     return this.securityAgent;
      case "GeneralAgent":
        return this.generalAgent;
      default:
        return this.generalAgent;
    }
  }

}