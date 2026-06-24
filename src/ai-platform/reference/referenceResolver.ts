// reference/reference-resolver.ts

import { inject, injectable, delay } from "tsyringe";

import { AIContext } from "@/ai-platform/context/types/context/ai.context";
import { SemanticContext } from "../domain/semantic/semantic-context";
import { EntityType } from "../domain/semantic/types/entity.type";
import { SearchListingUseCase } from "@/core/listing/application/usecase/searchListingUseCase";

@injectable()
export class ReferenceResolver {

  constructor(
    @inject(delay(() => SearchListingUseCase))
    private searchListingUseCase: SearchListingUseCase,
  ) {}

  async resolve(
    semantic: SemanticContext,
    context: AIContext
  ): Promise<SemanticContext> {

    const ordinalEntity = semantic.entities.find(
      e => e.type === EntityType.ORDINAL
    );

    if (!ordinalEntity) {
      return semantic;
    }

    // If no search results yet, auto-search first
    if (!context.resources.searchResults || context.resources.searchResults.length === 0) {
      console.log("🔗 ReferenceResolver: No search results — auto-searching before ordinal resolution");
      try {
        const searchResult = await this.searchListingUseCase.execute({});
        context.resources.searchResults = searchResult.listings;
        console.log(`🔗 ReferenceResolver: Auto-search returned ${searchResult.total} listings`);
      } catch (err) {
        console.error("🔗 ReferenceResolver: Auto-search failed:", err);
        return semantic;
      }
    }

    await this.resolveListingOrdinal(
      semantic,
      context,
      ordinalEntity.value
    );

    return semantic;
  }

  /**
   * Resolve:
   * "first / second / third" → listingId
   */
  private async resolveListingOrdinal(
    semantic: SemanticContext,
    context: AIContext,
    ordinal: string
  ): Promise<void> {

    const listings =
      context.resources.searchResults;

    if (!listings || listings.length === 0) {
      return;
    }

    let target = null;

    switch (ordinal) {
      case "first":
        target = listings[0];
        break;

      case "second":
        target = listings[1];
        break;

      case "third":
        target = listings[2];
        break;

      default:
        return;
    }

    if (!target) return;

    semantic.entities.push({
      type: EntityType.LISTING_ID,
      value: target.id
    });
  }
}
