// src/wisdom/semantic/extractors/listing.extractor.ts
//
// Extracts LISTING_ID entities from the message.
// Handles:
//   "listing 123", "listingId=abc", "listing: 456"
//   Context: falls back to request.context.resources?.listingId

import { injectable } from "tsyringe";
import { SemanticEntity } from "../semantic.entity";
import { EntityType } from "../../shared/enums/entity-type.enum";
import { ISemanticEntityExtractor } from "./entity-extractor.interface";

@injectable()
export class ListingExtractor implements ISemanticEntityExtractor {
  private contextListingId?: string;

  /** Set context listingId from outside (e.g. from WisdomRequest.context.resources) */
  setContextListingId(id: string | undefined): void {
    this.contextListingId = id;
  }

  extract(message: string): SemanticEntity[] {
    // Pattern 1: "listingId=xxx" or "listing: xxx" or "listing xxx"
    const patterns = [
      /listingid\s*=\s*([a-zA-Z0-9-]+)/i,
      /listing\s*:\s*([a-zA-Z0-9-]+)/i,
      /listing\s+([a-zA-Z0-9-]+)/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return [{
          type: EntityType.LISTING_ID,
          value: match[1],
          confidence: 0.95,
        }];
      }
    }

    // Pattern 2: Context fallback
    if (this.contextListingId) {
      return [{
        type: EntityType.LISTING_ID,
        value: this.contextListingId,
        confidence: 0.85,
      }];
    }

    return [];
  }
}
