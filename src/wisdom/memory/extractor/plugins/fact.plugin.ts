// src/wisdom/memory/extractor/plugins/fact.plugin.ts
//
// Extracts concrete facts from system responses and user-stated constraints.
// Source: search results, booking confirmations, entity details.
// Rule: if it came from a system response (search/booking), it's a fact.
//       if it came from user intent, it's a preference (handled by PreferencePlugin).
//
// ────────────────────────────────────────────────────────────────

import { injectable } from "tsyringe";
import { SemanticContext } from "@/wisdom/semantic/semantic-context";
import { WisdomResponse } from "@/wisdom/contracts/response";
import { AIContext } from "@/wisdom/contracts/ai-context";
import { FactLearnedDelta } from "../../type/cognitiveDelta";
import { IUserKnowledge } from "../../model/IUserKnowledge";
import { KnowledgePlugin } from "./knowledge-plugin.interface";

@injectable()
export class FactPlugin implements KnowledgePlugin {
  readonly name = "FactPlugin";

  extract(
    semantic: SemanticContext,
    response: WisdomResponse,
    _context: AIContext,
    knowledge: IUserKnowledge,
  ): FactLearnedDelta[] {
    const deltas: FactLearnedDelta[] = [];

    // ── Entity facts from semantic extraction (user-stated facts) ──
    for (const entity of semantic.entities ?? []) {
      // DATE_RANGE is a fact (concrete constraint), not a preference
      if (entity.type === "DATE_RANGE" && entity.value) {
        const factKey = `DATE_RANGE:${JSON.stringify(entity.value)}`;
        if (!this.hasFact(knowledge, factKey)) {
          deltas.push({
            kind: "FACT_LEARNED",
            data: {
              key: factKey,
              value: entity.value,
              confidence: 0.9,
              createdAt: Date.now(),
              source: "user",
            },
            evidence: `User specified date range: ${JSON.stringify(entity.value)}`,
          });
        }
      }

      // BOOKING_ID is a fact
      if (entity.type === "BOOKING_ID" && entity.value) {
        const factKey = `BOOKING_ID:${entity.value}`;
        if (!this.hasFact(knowledge, factKey)) {
          deltas.push({
            kind: "FACT_LEARNED",
            data: {
              key: factKey,
              value: entity.value,
              confidence: 0.95,
              createdAt: Date.now(),
              source: "user",
            },
            evidence: `User referenced booking ID: ${entity.value}`,
          });
        }
      }
    }

    // ── Booking facts from artifacts (system-confirmed) ──
    for (const artifact of response.artifacts ?? []) {
      if (artifact.type === "BOOKING" && artifact.content?.id) {
        const factKey = `BOOKING_CONFIRMED:${artifact.content.id}`;
        if (!this.hasFact(knowledge, factKey)) {
          deltas.push({
            kind: "FACT_LEARNED",
            data: {
              key: factKey,
              value: artifact.content,
              confidence: 0.95,
              createdAt: Date.now(),
              source: "behavior",
            },
            evidence: `Booking "${artifact.content.id}" was confirmed`,
          });
        }
      }

      // Listing facts from search results (system-returned)
      if (artifact.type === "LISTING_SEARCH_RESULT") {
        const content = artifact.content as Record<string, any>;
        const listings: any[] = content?.listings ?? content?.results ?? [];
        for (const listing of listings) {
          if (listing.id) {
            const factKey = `LISTING:${listing.id}`;
            if (!this.hasFact(knowledge, factKey)) {
              deltas.push({
                kind: "FACT_LEARNED",
                data: {
                  key: factKey,
                  value: { id: listing.id, title: listing.title, price: listing.price },
                  confidence: 0.85,
                  createdAt: Date.now(),
                  source: "behavior",
                },
                evidence: `Listing "${listing.title}" (${listing.id}) appeared in search results`,
              });
            }
          }
        }
      }
    }

    return deltas;
  }

  private hasFact(knowledge: IUserKnowledge, key: string): boolean {
    return knowledge.facts.some(f => f.key === key);
  }
}
