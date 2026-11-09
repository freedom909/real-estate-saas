// src/wisdom/agents/listing/listing.agent.ts

import { inject, injectable, delay } from "tsyringe";
import { IDomainAgent } from "../../contracts/agent";
import { EntityType, SemanticContext } from "../../semantic/semantic-context";

import { ArtifactType } from "../../shared/enums/artifact-type.enum";
import { AIContext } from "../../contracts/ai-context";
import { WisdomResponse } from "../../contracts/response";
import { GenerateListingAIOptimizationUseCase } from "@/wisdom/agents/listing/generateListingAIOptimization.usecase";
import GetListingUseCase from "@/core/listing/application/usecase/getListings.usecase";
import { SearchListingUseCase } from "@/core/listing/application/usecase/searchListingUseCase";
import { AgentAction } from "@/wisdom/shared/enums/action.enum";
import { toChatListingRows } from "./listing-row.serializer";
import { TOKENS_LOCATION } from "@/modules/tokens/location.tokens";
import { ILocationRepository } from "@/core/location/domain/repos/ILocationRepository";


const JP_PREFECTURE_MAP: Record<string, string> = {
  "東京": "東京都",
  "東京都": "東京都",
  "大阪": "大阪府",
  "大阪府": "大阪府",
  "京都": "京都府",
  "京都府": "京都府",
  "北海道": "北海道",
  "神奈川": "神奈川県",
  "横浜": "神奈川県",
  "愛知": "愛知県",
  "名古屋": "愛知県",
  "福岡": "福岡県",
  "札幌": "北海道",
};

function resolvePrefecture(location: string): string | undefined {
  return JP_PREFECTURE_MAP[location];
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

    @inject(TOKENS_LOCATION.locationRepository)
    private readonly locationRepository: ILocationRepository,
  ) { }

  async execute(semantic: SemanticContext, context: AIContext): Promise<WisdomResponse> {
    console.dir(
  {
    rawInput: semantic.rawInput,
    entities: semantic.entities,
    action: semantic.action,
  },
  { depth: null }
);
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
        summary: "物件IDが見つかりません。どの物件を操作したいか教えてください。",
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
          summary: result?.summary ?? "最適化が完了しました。",
          artifacts: result?.artifacts ?? [],
        };
      }

      case AgentAction.GET_LISTING: {
        const listing = await this.getListingUseCase.execute();
        return {
          success: true,
          domain: semantic.domain as any,
          primaryAction: { name: action, confidence: semantic.confidence ?? 0 },
          summary: `物件が見つかりました: ${listing.length}`,
          artifacts: [{
            type: ArtifactType.LISTING_SELECTED,
            content: { listings: await toChatListingRows(listing as unknown as any[]) },
          }],
        };
      }

      default:
        return {
          success: false,
          domain: semantic.domain as any,
          primaryAction: { name: action ?? "UNKNOWN", confidence: semantic.confidence ?? 0 },
          summary: `対応していない物件操作です: ${action}`,
          artifacts: [],
        };
    }
  }

  private async handleSearchOrAvailability(
    semantic: SemanticContext,
    action: AgentAction,
  ): Promise<WisdomResponse> {
const location = semantic.entities.find(
  (e) => e.type === EntityType.LOCATION
)?.value as string | undefined;
console.log("[LOCATION DEBUG] location:", location);

let locationIds: string[] | undefined;
if (location) {
  const prefecture = resolvePrefecture(location);
 if (!prefecture) {
    return {
      success: false,
      domain: semantic.domain as any,
      primaryAction: {
        name: action,
        confidence: semantic.confidence ?? 0,
      },
      summary: `「${location}」に対応する地域を特定できませんでした。都道府県名を指定してください。`,
      artifacts: [],
    };
  }

 const locations =
  await this.locationRepository.findByPrefecture(prefecture);

if (locations.length === 0) {
  return {
    success: false,
    domain: semantic.domain as any,
    primaryAction: {
      name: action,
      confidence: semantic.confidence ?? 0,
    },
    summary: `${prefecture}の登録地点が見つかりませんでした。`,
    artifacts: [],
  };
}

locationIds = locations.map((item) => item.id);

console.log("[LOCATION DEBUG] prefecture:", prefecture);
console.log("[LOCATION DEBUG] locations:", locations);
console.log("[LOCATION DEBUG] locationIds:", locationIds);

 

}
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
      locationIds,
      checkIn: checkIn ? new Date(checkIn as string) : undefined,
      checkOut: checkOut ? new Date(checkOut as string) : undefined,
      customerCount: customerCount ? parseInt(customerCount as string) : undefined,
      minPrice,
      maxPrice,
    });
    console.log(
      "[AI SEARCH RESULT BEFORE SERIALIZER]",
      (searchResult as any).listings?.map((listing: any) => ({
        id: listing.id,
        pictures: listing.pictures?.map((picture: any) => ({
          objectKey: picture.objectKey,
          url: picture.url,
        })),
      }))
    );

    const chatListings = await toChatListingRows(
      (searchResult as any).listings ?? []
    );
  console.log(
  "\n========== LISTING ARTIFACT IMAGE DIAGNOSTIC =========="
);

console.dir(
  {
    total: searchResult.total,

    listings: chatListings.map((listing: any) => ({
      id: listing.id,
      title: listing.title,

      pictureCount: listing.picture?.length ?? 0,
      firstPicture: listing.picture?.[0],

      picturesCount: listing.pictures?.length ?? 0,
      firstPicturesUrl: listing.pictures?.[0]?.url,

      image: listing.image,
      images: listing.images,
    })),
  },
  {
    depth: null,
    colors: true,
  }
);
    console.log(
      "[AI SEARCH RESULT AFTER SERIALIZER]",
      chatListings.map((listing: any) => ({
        id: listing.id,
        picture: listing.picture,
        pictures: listing.pictures,
      }))
    );
    return {
      success: true,
      domain: semantic.domain as any,
      primaryAction: { name: action, confidence: semantic.confidence ?? 0 },
      summary: `${searchResult.total}件の物件が見つかりました。`,
      artifacts: [{
        type: ArtifactType.LISTING_SEARCH_RESULT,
        content: { ...(searchResult as any), listings: chatListings, },
      }],
    };
  }
}
