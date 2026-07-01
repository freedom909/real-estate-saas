// src/wisdom/semantic/extractors/booking-id.extractor.ts
//
// Extracts BOOKING_ID entities from the message.
// Handles:
//   UUIDs: "booking abc12345-..."
//   Context: falls back to request.context.resources?.bookingId

import { injectable } from "tsyringe";
import { SemanticEntity } from "../semantic.entity";
import { EntityType } from "../../shared/enums/entity-type.enum";
import { ISemanticEntityExtractor } from "./entity-extractor.interface";

const UUID_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

@injectable()
export class BookingIdExtractor implements ISemanticEntityExtractor {
  private contextBookingId?: string;

  /** Set context bookingId from outside (e.g. from WisdomRequest.context.resources) */
  setContextBookingId(id: string | undefined): void {
    this.contextBookingId = id;
  }

  extract(message: string): SemanticEntity[] {
    // Pattern 1: UUID in message
    const uuidMatch = message.match(UUID_REGEX);
    if (uuidMatch) {
      return [{
        type: EntityType.BOOKING_ID,
        value: uuidMatch[0],
        confidence: 0.99,
      }];
    }

    // Pattern 2: Context fallback
    if (this.contextBookingId) {
      return [{
        type: EntityType.BOOKING_ID,
        value: this.contextBookingId,
        confidence: 0.85,
      }];
    }

    return [];
  }
}
