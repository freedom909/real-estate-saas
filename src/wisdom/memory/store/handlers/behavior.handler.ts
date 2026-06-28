// src/wisdom/memory/store/handlers/behavior.handler.ts
//
// Applies BEHAVIOR_LEARNED deltas — stored as facts with "behavior:" prefix.
//
// ────────────────────────────────────────────────────────────────

import { injectable } from "tsyringe";
import { IUserKnowledge } from "../../model/IUserKnowledge";
import { DeltaHandler } from "./delta-handler.interface";

@injectable()
export class BehaviorHandler implements DeltaHandler {
  readonly kind = "BEHAVIOR_LEARNED" as const;

  apply(
    knowledge: IUserKnowledge,
    data: { key: string; value: unknown; confidence: number },
  ): void {
    const factKey = `behavior:${data.key}`;
    const exists = knowledge.facts.some((f) => f.key === factKey);
    if (!exists) {
      knowledge.facts.push({
        key: factKey,
        value: data.value,
        confidence: data.confidence,
        createdAt: Date.now(),
        source: "behavior",
      });
    }
  }
}
