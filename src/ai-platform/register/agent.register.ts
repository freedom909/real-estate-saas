// src/gateway/cognition/register/agent.register.ts
import { container, DependencyContainer } from "tsyringe";
import { OptimizeContentExecutor } from "../domain/semantic/extractors/optimize-content.executor";
import { GenerateContentExecutor } from "../domain/semantic/extractors/generate-content.executor";
import { CancelBookingExecutor } from "../domain/semantic/extractors/cancel-booking.executor";
import { RefundPaymentExecutor } from "../domain/semantic/extractors/refund-payment.executor";
import { ListingFacetResolver } from "../domain/agents/listing/facets/listing-facet.resolver";
import { BookingFacetResolver } from "../domain/agents/booking/facets/booking-facet.resolver";
import { PaymentFacetResolver } from "../domain/agents/payment/facets/payment-facet.resolver";
import { ListingAgent } from "../domain/agents/listing/listing.agent";
import { BookingAgent } from "../domain/agents/booking/booking.agent";
import { PaymentAgent } from "../../subgraphs/payment/application/agents/payment.agent";


export function registerAgentDependencies( container: DependencyContainer): void {
  // Executors
  container.registerSingleton(OptimizeContentExecutor);
  container.registerSingleton(GenerateContentExecutor);
  container.registerSingleton(CancelBookingExecutor);
  container.registerSingleton(RefundPaymentExecutor);
  // Facet Resolvers
  container.registerSingleton(ListingFacetResolver);
  container.registerSingleton(BookingFacetResolver);
  container.registerSingleton(PaymentFacetResolver);
  // Agents
  container.registerSingleton(ListingAgent);
  container.registerSingleton(BookingAgent);
  container.registerSingleton(PaymentAgent);
}