// src/gateway/cognition/domain/agents/listing/facets/listing-facet.resolver.ts
import { injectable } from "tsyringe";
import { IExecutor, IFacetResolver } from "../../../planning/types/i-facet.resolver";
import { OptimizeContentExecutor } from "../../../semantic/extractors/optimize-content.executor";
import { GenerateContentExecutor } from "../../../semantic/extractors/generate-content.executor";
import { CapabilityType } from "../../../planning/types/enums";


@injectable()
export class ListingFacetResolver implements IFacetResolver {
  constructor(
    private optimizeContentExecutor: OptimizeContentExecutor,
    private generateContentExecutor: GenerateContentExecutor
  ) {}

  resolve(capability: CapabilityType): IExecutor {
    switch (capability) {
      case CapabilityType.OPTIMIZE_CONTENT: return this.optimizeContentExecutor;
      case CapabilityType.GENERATE_CONTENT: return this.generateContentExecutor;
      default: throw new Error(`No executor found for Listing capability: ${capability}`);
    }
  }
}