import { container } from "tsyringe";
import { TOKENS_FACET_RESOLVERS } from "../tokens/facet/facet.resolver";
import { ListingFacetResolver } from "@/ai-platform/domain/agents/listing/facets/listing-facet.resolver";
import { BookingFacetResolver } from "@/ai-platform/domain/agents/booking/facets/booking-facet.resolver";
import { OptimizeContentExecutor } from "@/ai-platform/domain/semantic/extractors/optimize-content.executor";
import { GenerateContentExecutor } from "@/ai-platform/domain/semantic/extractors/generate-content.executor";

export function registerFacetResolvers() {
  // Register Executors used by resolvers
  container.register(OptimizeContentExecutor, { useClass: OptimizeContentExecutor });
  container.register(GenerateContentExecutor, { useClass: GenerateContentExecutor });

  // Register Resolvers using tokens
  container.register(TOKENS_FACET_RESOLVERS.listingFacetResolver, {
    useClass: ListingFacetResolver,
  });
  container.register(TOKENS_FACET_RESOLVERS.bookingFacetResolver, {
    useClass: BookingFacetResolver,
  });
  container.register(TOKENS_FACET_RESOLVERS.paymentFacetResolver, {
    useClass: BookingFacetResolver, // Fallback until PaymentFacetResolver is implemented
  });
}