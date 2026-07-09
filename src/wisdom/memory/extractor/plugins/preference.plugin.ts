// src/wisdom/memory/extractor/plugins/preference.plugin.ts
//
// Extracts user preferences from intent.
// Source: user's explicit mentions, stated constraints.
// Rule: if it came from user intent, it's a preference.
//
// ────────────────────────────────────────────────────────────────

import { injectable } from "tsyringe";
import { SemanticContext } from "@/wisdom/semantic/semantic-context";
import { WisdomResponse } from "@/wisdom/contracts/response";
import { AIContext } from "@/wisdom/contracts/ai-context";
import { PreferenceLearnedDelta } from "../../type/cognitiveDelta";
import { IUserKnowledge } from "../../model/IUserKnowledge";
import { KnowledgePlugin } from "./knowledge-plugin.interface";

@injectable()
export class PreferencePlugin implements KnowledgePlugin {
  readonly name = "PreferencePlugin";

  extract(
    semantic: SemanticContext,
    _response: WisdomResponse,
    _context: AIContext,
    knowledge: IUserKnowledge,
  ): PreferenceLearnedDelta[] {
    const deltas: PreferenceLearnedDelta[] = [];

    for (const entity of semantic.entities ?? []) {
      // Location preference — ONLY from user intent, not from search results
      if (entity.type === "LOCATION" && entity.value) {
        if (!this.hasPreference(knowledge, "location", entity.value)) {
          deltas.push({
            kind: "PREFERENCE_LEARNED",
            data: {
              key: "location",
              value: entity.value,
              confidence: semantic.confidence,
              source: "user",
              createdAt: Date.now(),
            },
            evidence: `User mentioned location "${entity.value}"`,
          });
        }
      }

      // Price / budget preference — user intent
      if (entity.type === "PRICE_RANGE" && entity.value) {
        if (!this.hasPreference(knowledge, "priceRange", entity.value)) {
          deltas.push({
            kind: "PREFERENCE_LEARNED",
            data: {
              key: "priceRange",
              value: entity.value,
              confidence: semantic.confidence,
              source: "user",
              createdAt: Date.now(),
            },
            evidence: `User specified price range: ${JSON.stringify(entity.value)}`,
          });
        }
      }

      // Customer count — user intent
      if (entity.type === "CUSTOMER_COUNT" && entity.value) {
        if (!this.hasPreference(knowledge, "customerCount", entity.value)) {
          deltas.push({
            kind: "PREFERENCE_LEARNED",
            data: {
              key: "customerCount",
              value: entity.value,
              confidence: 0.9,
              source: "user",
              createdAt: Date.now(),
            },
            evidence: `User specified ${entity.value} customers`,
          });
        }
      }
    }

    return deltas;
  }

  private hasPreference(knowledge: IUserKnowledge, key: string, value: any): boolean {
    return knowledge.preferences.some(
      p => p.key === key && JSON.stringify(p.value) === JSON.stringify(value),
    );
  }
}
