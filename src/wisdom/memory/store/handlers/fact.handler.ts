// src/wisdom/memory/store/handlers/fact.handler.ts
//
// Applies FACT_LEARNED deltas — dedup by key.
//
// ────────────────────────────────────────────────────────────────

import { injectable } from "tsyringe";
import { IUserKnowledge } from "../../model/IUserKnowledge";
import { DeltaHandler } from "./delta-handler.interface";

@injectable()
export class FactHandler implements DeltaHandler {
  readonly kind = "FACT_LEARNED" as const;

  apply(
    knowledge: IUserKnowledge,
    data: { key: string; value: unknown; confidence: number; createdAt: number; source: string },
  ): void {
    const exists = knowledge.facts.some((f) => f.key === data.key);
    if (!exists) {
      knowledge.facts.push({
        key: data.key,
        value: data.value,
        confidence: data.confidence,
        createdAt: data.createdAt,
        source: data.source as any,
      });
    }
  }
}
