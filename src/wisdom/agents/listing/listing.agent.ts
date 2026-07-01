// src/wisdom/agents/listing/listing.agent.ts

import { inject, injectable, delay } from "tsyringe";
import { IDomainAgent } from "../../contracts/agent";
import { AgentAction, EntityType, SemanticContext } from "../../semantic/semantic-context";

import { ArtifactType } from "../../shared/enums/artifact-type.enum";
import { AIContext } from "../../contracts/ai-context";
import { WisdomResponse } from "../../contracts/response";
import { GenerateListingAIOptimizationUseCase } from "@/wisdom/agents/listing/generateListingAIOptimization.usecase";
import GetListingUseCase from "@/core/listing/application/usecase/getListingUseCase";
import { SearchListingUseCase } from "@/core/listing/application/usecase/searchListingUseCase";
import { SemanticEntityType } from "@/wisdom/semantic/semantic.entityType";

@injectable()
export class ListingAgent implements IDomainAgent {
  constructor(
    @inject(delay(() => GenerateListingAIOptimizationUseCase))
    private readonly optimizationUseCase: GenerateListingAIOptimizationUseCase,

    @inject(delay(() => GetListingUseCase))
    private readonly getListingUseCase: GetListingUseCase,

    @inject(delay(() => SearchListingUseCase))
    private readonly searchListingUseCase: SearchListingUseCase,
  ) {}

  async execute(semantic: SemanticContext, context: AIContext): Promise<WisdomResponse> {
    const action = semantic.action?.type;

    if (action === AgentAction.SEARCH_LISTING || action === AgentAction.CHECK_AVAILABILITY) {
      return this.handleSearchOrAvailability(semantic, action);
    }

    let listingId = semantic.entities.find(
      (e) => e.type === SemanticEntityType.LISTING,
    )?.value;

    if (!listingId && context.resources?.listingId) {
      listingId = context.resources.listingId;
    }

    if (!listingId) {
      return {
        success: false,
        domain: semantic.domain as any,
        primaryAction: { name: action ?? "UNKNOWN", confidence: semantic.confidence ?? 0 },
        summary: "Listing ID not found. Please specify which listing you want to work with.",
        artifacts: [],
      };
    }

    switch (action) {
      case AgentAction.OPTIMIZE_TITLE:
      case AgentAction.OPTIMIZE_DESCRIPTION: {
        const result = await this.optimizationUseCase.execute(listingId);
        return {
          success: true,
          domain: semantic.domain as any,
          primaryAction: { name: action, confidence: semantic.confidence ?? 0 },
          summary: result?.summary ?? "Optimization complete.",
          artifacts: result?.artifacts ?? [],
        };
      }

      case AgentAction.GET_LISTING: {
        const listing = await this.getListingUseCase.execute(listingId);
        return {
          success: true,
          domain: semantic.domain as any,
          primaryAction: { name: action, confidence: semantic.confidence ?? 0 },
          summary: `Found listing: ${listing.title}`,
          artifacts: [{
            type: ArtifactType.LISTING,
            content: listing as unknown as Record<string, unknown>,
          }],
        };
      }

      default:
        return {
          success: false,
          domain: semantic.domain as any,
          primaryAction: { name: action ?? "UNKNOWN", confidence: semantic.confidence ?? 0 },
          summary: `Unsupported listing action: ${action}`,
          artifacts: [],
        };
    }
  }

  private async handleSearchOrAvailability(
    semantic: SemanticContext,
    action: AgentAction,
  ): Promise<WisdomResponse> {
    const location = semantic.entities.find((e) => e.type === SemanticEntityType.LOCATION)?.value;
    const dateRange = semantic.entities.find((e) => e.type === SemanticEntityType.DATE_RANGE)?.value;
    const guestCount = semantic.entities.find((e) => e.type === SemanticEntityType.GUEST_COUNT)?.value;
    const priceRange = semantic.entities.find((e) => e.type === SemanticEntityType.PRICE_RANGE)?.value;

    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    if (priceRange) {
      const parts = priceRange.split("-");
      minPrice = parseInt(parts[0]);
      maxPrice = parts[1] ? parseInt(parts[1]) : undefined;
    }

    const searchResult = await this.searchListingUseCase.execute({
      location,
      dateRange,
      guestCount: guestCount ? parseInt(guestCount) : undefined,
      minPrice,
      maxPrice,
    });

    return {
      success: true,
      domain: semantic.domain as any,
      primaryAction: { name: action, confidence: semantic.confidence ?? 0 },
      summary: `Found ${searchResult.total} listings.`,
      artifacts: [{
        type: ArtifactType.LISTING_SEARCH_RESULT,
        content: searchResult as unknown as Record<string, unknown>,
      }],
    };
  }
}
