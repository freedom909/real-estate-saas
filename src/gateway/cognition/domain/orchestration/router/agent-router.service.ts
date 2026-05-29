import { injectable, container } from "tsyringe";

import { ListingAgent } from "../../agents/listing/listing.agent";
import { BookingAgent } from "../../agents/booking/booking.agent";
import { PaymentAgent } from "../../agents/payment/payment.agent";
import { AIDomain } from "@/shared/enums/ai-domain.enum";
import { IDomainAgent } from "../../planning/types/i-domain.agent";



@injectable()
export class AgentRouterService {
  constructor(
    private listingAgent: ListingAgent,
    private bookingAgent: BookingAgent,
    private paymentAgent: PaymentAgent
  ) {}

  route(domain: AIDomain): IDomainAgent {
    switch (domain) {
      case "LISTING":
        return this.listingAgent;

      case "BOOKING":
        return this.bookingAgent;

      case "PAYMENT":
        return this.paymentAgent;

      default:
        throw new Error(
          `No agent for ${domain}`
        );
    }
  }
}