// src/wisdom/semantic/extractors/location.extractor.ts
//
// Extracts LOCATION entities from the message.
// Handles English and Japanese patterns:
//   English: "in Kyoto", "near Tokyo", "around Osaka", "location: Tokyo"
//   Japanese: "京都で", "東京の近く", "大阪周辺", "ロケーション: 京都", "京都に泊まりたい"

import { injectable } from "tsyringe";
import { SemanticEntity } from "../semantic.entity";
import { EntityType } from "../../shared/enums/entity-type.enum";
import { ISemanticEntityExtractor } from "./entity-extractor.interface";

@injectable()
export class LocationExtractor implements ISemanticEntityExtractor {
  extract(message: string): SemanticEntity[] {
    const entities: SemanticEntity[] = [];

    // ── Japanese patterns ───────────────────────────────────────────────────

    // Pattern J1: "Locationで" (e.g. "京都で", "東京で探して")
    const jpDeMatch = message.match(/([\u3000-\u9fff\w]{2,10})で(?:泊|宿|過ご|旅行|滞在|探|検索)/);
    if (jpDeMatch) {
      entities.push({
        type: EntityType.LOCATION,
        value: jpDeMatch[1].trim(),
        confidence: 0.92,
      });
    }

    // Pattern J2: "Locationの近く" (e.g. "東京の近く", "駅の近く")
    const jpChikakuMatch = message.match(/([\u3000-\u9fff\w]{2,10})の近く/);
    if (jpChikakuMatch) {
      entities.push({
        type: EntityType.LOCATION,
        value: jpChikakuMatch[1].trim(),
        confidence: 0.88,
      });
    }

    // Pattern J3: "Location周辺" (e.g. "大阪周辺")
    const jpShuhenMatch = message.match(/([\u3000-\u9fff\w]{2,10})周辺/);
    if (jpShuhenMatch) {
      entities.push({
        type: EntityType.LOCATION,
        value: jpShuhenMatch[1].trim(),
        confidence: 0.88,
      });
    }

    // Pattern J4: "Locationに" (e.g. "京都に行きたい", "東京に泊まりたい")
    const jpNiMatch = message.match(/([\u3000-\u9fff\w]{2,10})に(?:行|来|泊|訪|滞|遊)/);
    if (jpNiMatch) {
      entities.push({
        type: EntityType.LOCATION,
        value: jpNiMatch[1].trim(),
        confidence: 0.85,
      });
    }

    // Pattern J5: "ロケーション: Location" or "場所: Location"
    const jpColonMatch = message.match(/(?:ロケーション|場所|立地)\s*[：:]\s*([^\s,、。]+)/i);
    if (jpColonMatch) {
      entities.push({
        type: EntityType.LOCATION,
        value: jpColonMatch[1].trim(),
        confidence: 0.95,
      });
    }

    // ── English patterns ────────────────────────────────────────────────────

    // Pattern 1: "in/near/around LocationName"
    const STOP = "(?:for|on|from|to|with|next|this|last|week|weekend|month|year|tomorrow|today|yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday|my|me|i|a|the|is|are|was|will|would|can|could)\\b";
    const locationRegex = new RegExp(`\\b(in|near|around)\\s+([A-Za-z][A-Za-z\\s]*?)(?=\\s+${STOP}|$|[.,!?])`, "gi");
    const matches = [...message.matchAll(locationRegex)];

    if (matches.length > 0) {
      const best = matches[matches.length - 1];
      entities.push({
        type: EntityType.LOCATION,
        value: best[2].trim(),
        confidence: 0.90,
      });
    } else {
      // Fallback: try "at LocationName"
      const TIME_WORDS = /^(next|last|this|today|tomorrow|yesterday|every|each)$/i;
      const atRegex = new RegExp(`\\bat\\s+([A-Za-z][A-Za-z\\s]*?)(?=\\s+${STOP}|$|[.,!?])`, "gi");
      const atMatches = [...message.matchAll(atRegex)];
      for (const m of atMatches) {
        const candidate = m[1].trim();
        if (!TIME_WORDS.test(candidate)) {
          entities.push({
            type: EntityType.LOCATION,
            value: candidate,
            confidence: 0.80,
          });
          break;
        }
      }
    }

    // Pattern 2: "location: LocationName"
    const colonMatch = message.match(/location\s*:\s*([^\s,]+)/i);
    if (colonMatch) {
      entities.push({
        type: EntityType.LOCATION,
        value: colonMatch[1].trim(),
        confidence: 0.95,
      });
    }

    return entities;
  }
}
