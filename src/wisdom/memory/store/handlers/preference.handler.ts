// src/wisdom/memory/store/handlers/preference.handler.ts
//
// Applies PREFERENCE_LEARNED deltas — dedup by key+value.
//
// ────────────────────────────────────────────────────────────────

import { injectable } from "tsyringe";
import { IUserKnowledge } from "../../model/IUserKnowledge";
import { DeltaHandler } from "./delta-handler.interface";

@injectable()
export class PreferenceHandler implements DeltaHandler {
  readonly kind = "PREFERENCE_LEARNED" as const;

  apply(
    knowledge: IUserKnowledge,
    data: { key: string; value: unknown; confidence: number; source?: string; createdAt?: number },
  ): void {
    const exists = knowledge.preferences.some(
      (p) => p.key === data.key && JSON.stringify(p.value) === JSON.stringify(data.value),
    );
    if (!exists) {
      knowledge.preferences.push({
        key: data.key,
        value: data.value,
        confidence: data.confidence,
        source: data.source as any,
        createdAt: data.createdAt ?? Date.now(),
      });
    }
  }
}
