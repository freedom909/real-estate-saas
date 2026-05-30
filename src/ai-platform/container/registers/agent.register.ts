import { container } from "tsyringe"
import { TOKENS_AGENT } from "../tokens/agent/action.agent"
import { ListingAgent } from "@/ai-platform/domain/agents/listing/listing.agent"
import { BookingAgent } from "@/ai-platform/domain/agents/booking/booking.agent"
import { PaymentAgent } from "@/ai-platform/domain/agents/payment/payment.agent"
import { GeneralAgent } from "@/ai-platform/domain/agents/generalAgent"

export function registerAgents() {
  container.register(TOKENS_AGENT.listingAgent, { useClass: ListingAgent });
  container.register(TOKENS_AGENT.bookingAgent, { useClass: BookingAgent });
  container.register(TOKENS_AGENT.paymentAgent, { useClass: PaymentAgent });
  container.register(TOKENS_AGENT.generalAgent, { useClass: GeneralAgent });
  // container.register(TOKENS_AGENT.securityAgent, { useClass: SecurityAgent });
  container.register(TOKENS_AGENT.reviewAgent, { useClass: GeneralAgent });
}