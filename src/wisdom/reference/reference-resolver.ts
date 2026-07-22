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

    // If user wants to book but didn't specify which listing, try to match by title/name
    const hasListingRef = semantic.entities.some(
      (e) => e.type === EntityType.LISTING_ID || e.type === EntityType.LISTING,
    );
    const isBookingIntent = semantic.action?.type === "CREATE_BOOKING";
    if (isBookingIntent && !hasListingRef && !ordinalEntity) {
      // Try title-based matching first
      const titleMatch = this.resolveByTitle(semantic.rawInput, context);
      if (titleMatch) {
        semantic.entities.push({
          type: EntityType.LISTING_ID,
          value: titleMatch.id,
          confidence: titleMatch.confidence,
        });
        return semantic;
      }

      // Fallback: auto-select first listing
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

  /**
   * Match user's natural language description against search result titles.
   * E.g. "book the beautiful flower room" → matches listing with "Flower" in title.
   */
  private resolveByTitle(
    message: string,
    context: AIContext,
  ): { id: string; confidence: number } | null {
    const listings = context.resources.searchResults;
    if (!listings || listings.length === 0) return null;

    // Extract descriptive keywords from the booking message
    // Remove common booking verbs/fillers to isolate the room description
    const description = message
      .toLowerCase()
      .replace(/\b(book|reserve|booked|reserving|i(?:'d| would) like|please|the|a|an|one|room|want|to)\b/gi, "")
      .replace(/(予約する|予約|して|ください|の|を|が|へ|に|で|は|も)/g, "")
      .trim();

    if (!description) return null;

    // Split into keywords for matching
    const keywords = description.split(/\s+/).filter((w) => w.length >= 2);
    if (keywords.length === 0) return null;

    let bestMatch: { id: string; confidence: number } | null = null;
    let bestScore = 0;

    for (const listing of listings) {
      const title = (listing.title ?? "").toLowerCase();
      const address = (listing.address ?? "").toLowerCase();
      const description = (listing.description ?? "").toLowerCase();
      const searchable = `${title} ${address} ${description}`;

      // Count how many keywords match
      let matchCount = 0;
      for (const keyword of keywords) {
        if (searchable.includes(keyword)) {
          matchCount++;
        }
      }

      if (matchCount > 0) {
        const score = matchCount / keywords.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = {
            id: listing.id,
            confidence: Math.min(0.6 + score * 0.35, 0.95),
          };
        }
      }
    }

    return bestMatch;
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
