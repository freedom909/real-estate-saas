// src/wisdom/agents/listing/listing.agent.ts

import { inject, injectable, delay } from "tsyringe";
import { IDomainAgent } from "../../contracts/agent";
import { EntityType, SemanticContext } from "../../semantic/semantic-context";

import { ArtifactType } from "../../shared/enums/artifact-type.enum";
import { AIContext } from "../../contracts/ai-context";
import { WisdomResponse } from "../../contracts/response";
import { GenerateListingAIOptimizationUseCase } from "@/wisdom/agents/listing/generateListingAIOptimization.usecase";
import GetListingUseCase from "@/core/listing/application/usecase/getListingUseCase";
import { SearchListingUseCase } from "@/core/listing/application/usecase/searchListingUseCase";
import { AgentAction } from "@/wisdom/shared/enums/action.enum";


// Common Japanese location names → English (matches DB address values)
const JP_LOCATION_MAP: Record<string, string> = {
  "東京": "Tokyo",
  "京都": "Kyoto",
  "大阪": "Osaka",
  "名古屋": "Nagoya",
  "札幌": "Sapporo",
  "福岡": "Fukuoka",
  "横浜": "Yokohama",
  "神戸": "Kobe",
  "奈良": "Nara",
  "沖縄": "Okinawa",
  "鎌倉": "Kamakura",
  "箱根": "Hakone",
  "輕井澤": "Karuizawa",
  "軽井沢": "Karuizawa",
  "北海道": "Hokkaido",
  "仙台": "Sendai",
  "広島": "Hiroshima",
  "金沢": "Kanazawa",
  "長崎": "Nagasaki",
  "熊本": "Kumamoto",
  "那覇": "Naha",
};

function translateLocation(location: string): string {
  // Try exact match first
  if (JP_LOCATION_MAP[location]) return JP_LOCATION_MAP[location];
  // Try partial match (e.g. "東京渋谷" → "Tokyo")
  for (const [jp, en] of Object.entries(JP_LOCATION_MAP)) {
    if (location.includes(jp)) return en;
  }
  return location;
}

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
    const translatedLocation = location ? translateLocation(location as string) : undefined;
    const checkIn = semantic.entities.find((e) => e.type === EntityType.CHECK_IN_DATE)?.value;
    const checkOut = semantic.entities.find((e) => e.type === EntityType.CHECK_OUT_DATE)?.value;
    const dateRange = checkIn && checkOut ? `${checkIn} to ${checkOut}` : undefined;
    const customerCount = semantic.entities.find((e) => e.type === EntityType.CUSTOMER_COUNT)?.value;
    const priceRange = semantic.entities.find((e) => e.type === EntityType.PRICE_RANGE)?.value;

    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    if (priceRange) {
      const parts = (priceRange as string).split("-");
      minPrice = parseInt(parts[0]);
      maxPrice = parts[1] ? parseInt(parts[1]) : undefined;
    }

    const searchResult = await this.searchListingUseCase.execute({
      location: translatedLocation,
      checkIn: checkIn as string | undefined,
      checkOut: checkOut as string | undefined,
      customerCount: customerCount ? parseInt(customerCount as string) : undefined,
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
