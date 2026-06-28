// src/wisdom/memory/store/handlers/summary.handler.ts
//
// Applies SUMMARY_CREATED deltas — bounded list of conversation summaries.
//
// ────────────────────────────────────────────────────────────────

import { injectable } from "tsyringe";
import { IUserKnowledge } from "../../model/IUserKnowledge";
import { DeltaHandler } from "./delta-handler.interface";

const MAX_SUMMARIES = 20;

@injectable()
export class SummaryHandler implements DeltaHandler {
  readonly kind = "SUMMARY_CREATED" as const;

  apply(
    knowledge: IUserKnowledge,
    data: { text: string; createdAt: number; confidence: number },
  ): void {
    knowledge.summaries.push(data);
    // Keep only the most recent summaries
    if (knowledge.summaries.length > MAX_SUMMARIES) {
      knowledge.summaries = knowledge.summaries.slice(-MAX_SUMMARIES);
    }
  }
}
