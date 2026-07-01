// src/wisdom/semantic/extractors/location.extractor.ts
//
// Extracts LOCATION entities from the message.
// Handles patterns like:
//   "in Kyoto", "in ibaraki", "near Tokyo"
//   "location: Osaka"
//   "rooms in Kyoto"

import { injectable } from "tsyringe";
import { SemanticEntity } from "../semantic.entity";
import { EntityType } from "../../shared/enums/entity-type.enum";
import { ISemanticEntityExtractor } from "./entity-extractor.interface";

@injectable()
export class LocationExtractor implements ISemanticEntityExtractor {
  extract(message: string): SemanticEntity[] {
    const entities: SemanticEntity[] = [];

    // Pattern 1: "in LocationName", "near LocationName", "around LocationName"
    // const prepositionMatch = message.match(/(?:in|near|around|at|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    //   const prepositionMatch = message.match(/(?:in|near|around|at)\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)/i);
       const prepositionMatch = message.match(/\b(?:in|near|around|at)\s+([a-z]+)/i);
    if (prepositionMatch) {
      entities.push({
        type: EntityType.LOCATION,
        value: prepositionMatch[1],
        confidence: 0.90,
      });
    }

    // Pattern 2: "location: LocationName"
    const colonMatch = message.match(/location\s*:\s*([^\s,]+)/i);
    if (colonMatch) {
      entities.push({
        type: EntityType.LOCATION,
        value: colonMatch[1],
        confidence: 0.95,
      });
    }

    return entities;
  }
}
