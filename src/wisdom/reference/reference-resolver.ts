// src/wisdom/reference/reference-resolver.ts

import { inject, injectable, delay } from "tsyringe";
import { IReferenceResolver } from "../contracts/reference-resolver";
import { SemanticContext } from "../semantic/semantic-context";
import { EntityType } from "../shared/enums/entity-type.enum";
import { AIContext } from "../contracts/ai-context";
import { SearchListingUseCase } from "@/core/listing/application/usecase/searchListingUseCase";


@injectable()
export class ReferenceResolver implements IReferenceResolver {
  constructor(
    @inject(delay(() => SearchListingUseCase))
    private searchListingUseCase: SearchListingUseCase,
  ) {}

  async resolve(
    semantic: SemanticContext,
    context: AIContext,
  ): Promise<SemanticContext> {
    const ordinalEntity = semantic.entities.find(
      (e) => e.type === EntityType.ORDINAL,
    );

    // If user wants to book but didn't specify which listing, auto-select first
    const hasListingRef = semantic.entities.some(
      (e) => e.type === EntityType.LISTING_ID || e.type === EntityType.LISTING,
    );
    const isBookingIntent = semantic.action?.type === "CREATE_BOOKING";
    if (isBookingIntent && !hasListingRef && !ordinalEntity) {
      const listings = context.resources.searchResults;
      if (listings && listings.length > 0) {
        semantic.entities.push({
          type: EntityType.LISTING_ID,
          value: listings[0].id,
          confidence: 0.90,
        });
        return semantic;
      }
    }

    if (!ordinalEntity) {
      return semantic;
    }

    // Auto-search if no results exist yet
    if (!context.resources.searchResults || context.resources.searchResults.length === 0) {
      try {
        const searchResult = await this.searchListingUseCase.execute({location: context.resources.location,checkIn: context.resources.checkIn,checkOut: context.resources.checkOut,customerCount: context.resources.customerCount});
        context.resources.searchResults = searchResult.listings;
      } catch {
        return semantic;
      }
    }

    this.resolveListingOrdinal(semantic, context, ordinalEntity.value as string);
    return semantic;
  }

  private resolveListingOrdinal(
    semantic: SemanticContext,
    context: AIContext,
    ordinal: string,
  ): void {
    const listings = context.resources.searchResults;
    if (!listings || listings.length === 0) return;

    const indexMap: Record<string, number> = {
      first: 0, second: 1, third: 2,
    };
    const index = indexMap[ordinal];
    if (index === undefined) return;

    const target = listings[index];
    if (!target) return;

    semantic.entities.push({
      type: EntityType.LISTING_ID,
      value: target.id,
      confidence: 1,
    });
  }
}
