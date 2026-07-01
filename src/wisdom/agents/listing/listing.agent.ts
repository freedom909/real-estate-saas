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
      (e) => e.type === EntityType.LISTING_ID,
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
        const result = await this.optimizationUseCase.execute(listingId as string);
        return {
          success: true,
          domain: semantic.domain as any,
          primaryAction: { name: action, confidence: semantic.confidence ?? 0 },
          summary: result?.summary ?? "Optimization complete.",
          artifacts: result?.artifacts ?? [],
        };
      }

      case AgentAction.GET_LISTING: {
        const listing = await this.getListingUseCase.execute(listingId as string);
        return {
          success: true,
          domain: semantic.domain as any,
          primaryAction: { name: action, confidence: semantic.confidence ?? 0 },
          summary: `Found listing: ${listing.title}`,
          artifacts: [{
            type: ArtifactType.LISTING_SELECTED,
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
    const location = semantic.entities.find((e) => e.type === EntityType.LOCATION)?.value;
    const checkIn = semantic.entities.find((e) => e.type === EntityType.CHECK_IN_DATE)?.value;
    const checkOut = semantic.entities.find((e) => e.type === EntityType.CHECK_OUT_DATE)?.value;
    const dateRange = checkIn && checkOut ? `${checkIn} to ${checkOut}` : undefined;
    const guestCount = semantic.entities.find((e) => e.type === EntityType.GUEST_COUNT)?.value;
    const priceRange = semantic.entities.find((e) => e.type === EntityType.PRICE_RANGE)?.value;

    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    if (priceRange) {
      const parts = (priceRange as string).split("-");
      minPrice = parseInt(parts[0]);
      maxPrice = parts[1] ? parseInt(parts[1]) : undefined;
    }

    const searchResult = await this.searchListingUseCase.execute({
      location: location as string,
      dateRange: dateRange as string,
      guestCount: guestCount ? parseInt(guestCount as string) : undefined,
      minPrice,
      maxPrice,
    });
console.log("searchResult++:", searchResult);
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
