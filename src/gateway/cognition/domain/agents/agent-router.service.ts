import { injectable, container } from "tsyringe";
import { Task } from "../planning/planners/task";
import { ListingAgent } from "./listing/listing.agent";
import { BookingAgent } from "./booking/booking.agent";
import { PaymentAgent } from "./payment/payment.agent";
import { AIDomain } from "../planning/types/enums";


export interface IDomainAgent {
  execute(task: Task): Promise<any>;
}

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