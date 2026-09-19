//src/wisdom/reference/IlistingReference-resolver.ts


import { inject, injectable, delay } from "tsyringe";

import { SemanticContext } from "../semantic/semantic-context";
import { EntityType } from "../shared/enums/entity-type.enum";
import { AIContext } from "../contracts/ai-context";
import { IListingReferenceResolver } from "../contracts/Ilisting-reference.resolver";

import { SearchListingUseCase } from "@/core/listing/application/usecase/searchListingUseCase";
import { GetLocationsUseCase } from "@/core/location/application/usecases/getLocationsUseCase";

import { ListingSearchResultMapper } from "./mappers/listing-search-result.mapper";

@injectable()
export class ListingReferenceResolver
  implements IListingReferenceResolver
{
  constructor(
    @inject(delay(() => SearchListingUseCase))
    private searchListingUseCase: SearchListingUseCase,

    @inject(delay(() => GetLocationsUseCase))
    private getLocationsUseCase: GetLocationsUseCase,
  ) {}

  async resolve(
    semantic: SemanticContext,
    context: AIContext,
  ): Promise<SemanticContext> {
    const ordinalEntity = semantic.entities.find(
      (e) => e.type === EntityType.ORDINAL,
    );

    // If user wants to book but didn't specify which listing,
    // try to resolve it.
    const hasListingRef = semantic.entities.some(
      (e) =>
        e.type === EntityType.LISTING_ID ||
        e.type === EntityType.LISTING,
    );

    const isBookingIntent =
      semantic.action?.type === "CREATE_BOOKING";

    /*
     * Case 1:
     *
     * User wants to create a booking but did not specify
     * a listing ID, listing entity, or ordinal.
     *
     * Example:
     *   "Book the cheapest room in Kyoto."
     */
    if (
      isBookingIntent &&
      !hasListingRef &&
      !ordinalEntity
    ) {
      // Auto-search if no results exist yet.
      if (
        !context.resources.searchResults ||
        context.resources.searchResults.length === 0
      ) {
        try {
          const locationId =
            await this.resolveLocationId(
              context.resources.location,
            );

          const result =
            await this.searchListingUseCase.execute({
              locationId,

              checkIn: context.resources.checkIn
                ? new Date(
                    context.resources.checkIn,
                  )
                : undefined,

              checkOut: context.resources.checkOut
                ? new Date(
                    context.resources.checkOut,
                  )
                : undefined,

              customerCount:
                context.resources.customerCount,
            });

          context.resources.searchResults =
            ListingSearchResultMapper.toWisdomList(
              result.listings,
            );
        } catch {
          return semantic;
        }
      }

      // Try price-based selection first.
      // Examples:
      //   "cheapest"
      //   "most expensive"
      //   "最安"
      //   "最高"
      const priceMatch = this.resolveByPrice(
        semantic.rawInput,
        context,
      );

      if (priceMatch) {
        semantic.entities.push({
          type: EntityType.LISTING_ID,
          value: priceMatch.id,
          confidence: priceMatch.confidence,
        });

        return semantic;
      }

      // Try title-based matching.
      const titleMatch = this.resolveByTitle(
        semantic.rawInput,
        context,
      );

      if (titleMatch) {
        semantic.entities.push({
          type: EntityType.LISTING_ID,
          value: titleMatch.id,
          confidence: titleMatch.confidence,
        });

        return semantic;
      }

      // Fallback:
      // automatically select the first listing.
      const listings =
        context.resources.searchResults;

      if (listings && listings.length > 0) {
        semantic.entities.push({
          type: EntityType.LISTING_ID,
          value: listings[0].id,
          confidence: 0.90,
        });

        return semantic;
      }
    }

    /*
     * Case 2:
     *
     * No ordinal was specified.
     *
     * Nothing more to resolve.
     */
    if (!ordinalEntity) {
      return semantic;
    }

    /*
     * Case 3:
     *
     * User specified an ordinal.
     *
     * Examples:
     *   "book the first one"
     *   "reserve the second listing"
     *   "第一间"
     */
    if (
      !context.resources.searchResults ||
      context.resources.searchResults.length === 0
    ) {
      try {
        const locationId =
          await this.resolveLocationId(
            context.resources.location,
          );

        const result =
          await this.searchListingUseCase.execute({
            locationId,

            checkIn: context.resources.checkIn
              ? new Date(
                  context.resources.checkIn,
                )
              : undefined,

            checkOut: context.resources.checkOut
              ? new Date(
                  context.resources.checkOut,
                )
              : undefined,

            customerCount:
              context.resources.customerCount,
          });

        context.resources.searchResults =
          ListingSearchResultMapper.toWisdomList(
            result.listings,
          );
      } catch {
        return semantic;
      }
    }

    this.resolveListingOrdinal(
      semantic,
      context,
      ordinalEntity.value as string,
    );

    return semantic;
  }

  /**
   * Resolve a natural-language location into
   * the actual Location ID used by the Listing domain.
   *
   * Example:
   *
   *   "京都"
   *       ↓
   *   Location {
   *     id: "...",
   *     prefecture: "京都府",
   *     city: "京都市"
   *   }
   *       ↓
   *   locationId
   */
  private async resolveLocationId(
    location?: string,
  ): Promise<string | undefined> {
    if (!location?.trim()) {
      return undefined;
    }

    const keyword = location
      .trim()
      .toLowerCase();

    const locations =
      await this.getLocationsUseCase.execute();

    const matched = locations.find((item) => {
      const values = [
        item.name,
        item.address,
        item.city,
        item.town,
        item.prefecture,
      ]
        .filter(Boolean)
        .map((value) =>
          value.toLowerCase(),
        );

      return values.some(
        (value) =>
          value === keyword ||
          value.includes(keyword) ||
          keyword.includes(value),
      );
    });

    return matched?.id;
  }

  /**
   * Select listing by price intent.
   *
   * Examples:
   *   "cheapest"
   *   "lowest price"
   *   "most affordable"
   *   "最安"
   *   "most expensive"
   *   "最高"
   */
  private resolveByPrice(
    message: string,
    context: AIContext,
  ): {
    id: string;
    confidence: number;
  } | null {
    const listings =
      context.resources.searchResults;

    if (
      !listings ||
      listings.length === 0
    ) {
      return null;
    }

    const lower = message.toLowerCase();

    const wantsCheapest =
      /\b(cheapest|lowest\s*price|least\s*expensive|most\s*affordable|安い|最安)\b/i.test(
        lower,
      );

    const wantsMostExpensive =
      /\b(most\s*expensive|highest\s*price|priciest|premium|高い|最高)\b/i.test(
        lower,
      );

    if (
      !wantsCheapest &&
      !wantsMostExpensive
    ) {
      return null;
    }

    const sorted = [...listings].sort(
      (a, b) => {
        const priceA =
          typeof a.price === "number"
            ? a.price
            : 0;

        const priceB =
          typeof b.price === "number"
            ? b.price
            : 0;

        return wantsCheapest
          ? priceA - priceB
          : priceB - priceA;
      },
    );

    const target = sorted[0];

    if (!target) {
      return null;
    }

    return {
      id: target.id,
      confidence: 0.92,
    };
  }

  /**
   * Match user's natural-language description
   * against search result titles / addresses /
   * descriptions.
   *
   * Example:
   *
   *   "book the beautiful flower room"
   *
   *   ↓
   *
   *   listing.title = "Flower Room"
   */
  private resolveByTitle(
    message: string,
    context: AIContext,
  ): {
    id: string;
    confidence: number;
  } | null {
    const listings =
      context.resources.searchResults;

    if (
      !listings ||
      listings.length === 0
    ) {
      return null;
    }

    const description = message
      .toLowerCase()
      .replace(
        /\b(book|reserve|booked|reserving|i(?:'d| would) like|please|the|a|an|one|room|want|to|cheapest|most|expensive|lowest|price|least|affordable)\b/gi,
        "",
      )
      .replace(
        /(予約する|予約|して|ください|の|を|が|へ|に|で|は|も|安い|高い|最安)/g,
        "",
      )
      .trim();

    if (!description) {
      return null;
    }

    const keywords = description
      .split(/\s+/)
      .filter(
        (word) => word.length >= 2,
      );

    if (keywords.length === 0) {
      return null;
    }

    let bestMatch: {
      id: string;
      confidence: number;
    } | null = null;

    let bestScore = 0;

    for (const listing of listings) {
      const title = (
        listing.title ?? ""
      ).toLowerCase();

      const address = (
        listing.address ?? ""
      ).toLowerCase();

      const desc = (
        listing.description ?? ""
      ).toLowerCase();

      const searchable =
        `${title} ${address} ${desc}`;

      let matchCount = 0;

      for (const keyword of keywords) {
        if (
          searchable.includes(keyword)
        ) {
          matchCount++;
        }
      }

      if (matchCount > 0) {
        const score =
          matchCount / keywords.length;

        if (score > bestScore) {
          bestScore = score;

          bestMatch = {
            id: listing.id,
            confidence: Math.min(
              0.6 + score * 0.35,
              0.95,
            ),
          };
        }
      }
    }

    return bestMatch;
  }

  /**
   * Resolve ordinal listing references.
   *
   * Examples:
   *   first  -> index 0
   *   second -> index 1
   *   third  -> index 2
   */
  private resolveListingOrdinal(
    semantic: SemanticContext,
    context: AIContext,
    ordinal: string,
  ): void {
    const listings =
      context.resources.searchResults;

    if (
      !listings ||
      listings.length === 0
    ) {
      return;
    }

    const indexMap: Record<
      string,
      number
    > = {
      first: 0,
      second: 1,
      third: 2,
    };

    const index =
      indexMap[ordinal];

    if (index === undefined) {
      return;
    }

    const target = listings[index];

    if (!target) {
      return;
    }

    semantic.entities.push({
      type: EntityType.LISTING_ID,
      value: target.id,
      confidence: 1,
    });
  }
}

