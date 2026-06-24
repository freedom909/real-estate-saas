// ReferenceResolver.ts
// Resolves references to the entities in the user's message
// e.g. "book the first one" → "book the listing listingId"
// e.g. "confirm the booking bookingId" → "confirm the booking bookingId"
// reference/reference-resolver.ts

import { injectable } from "tsyringe";
import { SemanticContext } from "../domain/orchestration";
import { RuntimeContext } from "../domain/semantic/types/runtimeContext";
import { EntityType } from "../domain/semantic/semantic-context";



@injectable()
export class ReferenceResolver {

  async resolve(
    semantic: SemanticContext,
    runtime: RuntimeContext
  ): Promise<SemanticContext> {

    const ordinal =
      semantic.entities.find(
        e => e.type === EntityType.ORDINAL
      );

    if (!ordinal) {
      return semantic;
    }

    await this.resolveListingOrdinal(
      semantic,
      runtime,
      ordinal.value
    );

    return semantic;
  }

  private async resolveListingOrdinal(
    semantic: SemanticContext,
    runtime: RuntimeContext,
    ordinal: string
  ) {

    const listings =
      runtime.lastListings;

    if (!listings?.length) {
      return;
    }

    let target;

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
    }

    if (!target) {
      return;
    }

    semantic.entities.push({
      type: EntityType.LISTING_ID,
      value: target.id
    });
  }
}