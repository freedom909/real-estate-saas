//

import { container } from "tsyringe";

import { TOKENS_LISTING_FACET_RESOLVERS } from "../../tokens/facet/listing.facet";
import { OptimizeContentExecutor } from "@/ai-platform/domain/semantic/extractors/optimize-content.executor";

export async function listingFacetResolver() {//what paramter should be passed?should it be definited a interface about 'title','desc'...
  container.register(TOKENS_LISTING_FACET_RESOLVERS.optimizeContentExecutor, {
    useValue: OptimizeContentExecutor,
  });

}