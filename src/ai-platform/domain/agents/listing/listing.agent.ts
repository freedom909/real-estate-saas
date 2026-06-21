import { inject, injectable, delay } from "tsyringe";

import { IDomainAgent }
  from "../../semantic/types/IDomainAgent";

import { AgentAction, EntityType, SemanticContext }
  from "../../semantic/semantic-context";

import { AIContext } from "@/ai-platform/context/types/context/ai.context";
import { GenerateListingAIOptimizationUseCase } from "@/ai-platform/application/usecases/listing/generateListingAIOptimization.usecase";
import { ArtifactType } from "@/ai-platform/context/types/context/agent.result";
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

  async execute(
    semantic: SemanticContext,
    context: AIContext
  ) {

    console.log(
      "📌 ListingAgent",
      semantic.action.type
    );

    const action = semantic.action?.type;

    // SEARCH_LISTING and CHECK_AVAILABILITY don't require a listingId
    if (action === AgentAction.SEARCH_LISTING || action === AgentAction.CHECK_AVAILABILITY) {
      return this.handleSearchOrAvailability(semantic, action);
    }

    // All other actions require a listingId
    let listingId =
      semantic.entities.find(
        e =>
          e.type === EntityType.LISTING_ID
      )?.value;

    // If listingId not found in semantic entities, try context resources
    if (!listingId && context.resources?.listingId) {
      listingId = context.resources.listingId;
    }

    if (!listingId) {
      throw new Error(
        "Listing ID not found in semantic context or AI context resources."
      );
    }

    switch (action) {

      case AgentAction.OPTIMIZE_TITLE:
      case AgentAction.OPTIMIZE_DESCRIPTION: {
        const result = await this.optimizationUseCase.execute(listingId);
        return result;
      }

      case AgentAction.GET_LISTING: {
        const listing = await this.getListingUseCase.execute(listingId);
        return {
          success: true,
          domain: semantic.domain,
          primaryAction: {
            name: action,
            confidence: semantic.confidence ?? 0,
          },
          summary: `Found listing: ${listing.title}`,
          artifacts: [{
            type: ArtifactType.LISTING,
            content: listing as unknown as Record<string, unknown>,
          }],
        };
      }

      default:
        throw new Error(
          `Unsupported listing action: ${action}`
        );
    }
  }

  private async handleSearchOrAvailability(
    semantic: SemanticContext,
    action: AgentAction
  ) {
    // Extract search parameters from entities
    const location = semantic.entities.find(
      e => e.type === EntityType.LOCATION
    )?.value;

    const dateRange = semantic.entities.find(
      e => e.type === EntityType.DATE_RANGE
    )?.value;

    const guestCount = semantic.entities.find(
      e => e.type === EntityType.GUEST_COUNT
    )?.value;

    const priceRange = semantic.entities.find(
      e => e.type === EntityType.PRICE_RANGE
    )?.value;

    // Parse price range if present (e.g. "100-200")
    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    if (priceRange) {
      const parts = priceRange.split("-");
      if (parts.length === 2) {
        minPrice = Number(parts[0]);
        maxPrice = Number(parts[1]);
      }
    }

    const searchResult = await this.searchListingUseCase.execute({
      location,
      guestCount: guestCount ? Number(guestCount) : undefined,
      minPrice,
      maxPrice,
      limit: 20,
    });

    // Build the artifact based on action type
    if (action === AgentAction.CHECK_AVAILABILITY) {
      return {
        success: true,
        domain: semantic.domain,
        primaryAction: {
          name: action,
          confidence: semantic.confidence ?? 0,
        },
        summary: searchResult.listings.length > 0
          ? `Found ${searchResult.listings.length} available listings${location ? ` in ${location}` : ""}${dateRange ? ` for ${dateRange}` : ""}.`
          : `No listings available${location ? ` in ${location}` : ""}${dateRange ? ` for ${dateRange}` : ""}.`,
        artifacts: [{
          type: ArtifactType.AVAILABILITY_CHECK,
          content: {
            query: { location, dateRange, guestCount },
            results: searchResult.listings,
            total: searchResult.total,
          } as Record<string, unknown>,
        }],
      };
    }

    // SEARCH_LISTING
    return {
      success: true,
      domain: semantic.domain,
      primaryAction: {
        name: action,
        confidence: semantic.confidence ?? 0,
      },
      summary: searchResult.listings.length > 0
        ? `Found ${searchResult.listings.length} listings${location ? ` in ${location}` : ""}.`
        : `No listings found${location ? ` in ${location}` : ""}.`,
      artifacts: [{
        type: ArtifactType.LISTING_SEARCH_RESULT,
        content: {
          query: { location, dateRange, guestCount, minPrice, maxPrice },
          results: searchResult.listings,
          total: searchResult.total,
        } as Record<string, unknown>,
      }],
    };
  }
}
