// src/wisdom/memory/extractor/plugins/behavior.plugin.ts
//
// Extracts user behavior patterns from search results and interaction patterns.
// Source: search result type consistency, repeated actions, etc.
//
// ────────────────────────────────────────────────────────────────

import { injectable } from "tsyringe";
import { SemanticContext } from "@/wisdom/semantic/semantic-context";
import { WisdomResponse } from "@/wisdom/contracts/response";
import { AIContext } from "@/wisdom/contracts/ai-context";
import { BehaviorLearnedDelta } from "../../type/cognitiveDelta";
import { IUserKnowledge } from "../../model/IUserKnowledge";
import { KnowledgePlugin } from "./knowledge-plugin.interface";

@injectable()
export class BehaviorPlugin implements KnowledgePlugin {
  readonly name = "BehaviorPlugin";

  extract(
    _semantic: SemanticContext,
    _response: WisdomResponse,
    context: AIContext,
    knowledge: IUserKnowledge,
  ): BehaviorLearnedDelta[] {
    const deltas: BehaviorLearnedDelta[] = [];

    // Infer listing type preference from search result patterns
    const searchResults = context.resources?.searchResults;
    if (searchResults && searchResults.length >= 2) {
      const types = searchResults
        .map((r: any) => r.type ?? r.listingType ?? r.category)
        .filter(Boolean);
      const unique = [...new Set(types)];
      if (unique.length === 1) {
        const behaviorKey = `listingTypePreference:${unique[0]}`;
        if (!this.hasBehavior(knowledge, behaviorKey)) {
          deltas.push({
            kind: "BEHAVIOR_LEARNED",
            data: {
              key: behaviorKey,
              value: { preferredType: unique[0], basedOnResults: types.length },
              confidence: 0.5,
            },
            evidence: `All ${types.length} search results are type "${unique[0]}"`,
          });
        }
      }
    }

    return deltas;
  }

  private hasBehavior(knowledge: IUserKnowledge, key: string): boolean {
    // Behaviors are stored as facts with a "behavior:" prefix
    return knowledge.facts.some(f => f.key === `behavior:${key}`);
  }
}
