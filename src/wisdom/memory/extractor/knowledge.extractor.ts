// src/wisdom/memory/extractor/knowledge.extractor.ts
//
// KnowledgeExtractor — extracts knowledge from a single conversation turn.
//
// Pipeline:
//   SemanticContext + WisdomResponse + PreviousKnowledge
//         │
//         ▼
//   KnowledgeDelta[]  (preference / fact / goal / summary)
//         │
//         ▼
//   KnowledgeStore.persist()
//
// This is a pure function: given inputs, produce deltas.
// No side effects, no state mutation.
//
// ────────────────────────────────────────────────────────────────

import { injectable } from "tsyringe";
import { SemanticContext } from "@/wisdom/semantic/semantic-context";
import { WisdomResponse } from "@/wisdom/contracts/response";
import { AIContext } from "@/wisdom/contracts/ai-context";
import {
  KnowledgeDelta,
  PreferenceLearnedDelta,
  FactLearnedDelta,
  GoalLearnedDelta,
  SummaryCreatedDelta,
} from "../type/cognitiveDelta";
import {
  IUserKnowledge,
  PreferenceMemory,
  FactMemory,
  GoalMemory,
} from "../model/IUserKnowledge";

@injectable()
export class KnowledgeExtractor {

  /**
   * Extract all knowledge deltas from a single conversation turn.
   *
   * @param semantic  — what the system understood from user input
   * @param response  — what the agent produced
   * @param context   — the full AI context (identity, resources)
   * @param knowledge — existing long-term knowledge (to avoid duplicates)
   * @returns KnowledgeDelta[] — new knowledge worth persisting
   */
  extract(
    semantic: SemanticContext,
    response: WisdomResponse,
    context: AIContext,
    knowledge: IUserKnowledge,
  ): KnowledgeDelta[] {
    const deltas: KnowledgeDelta[] = [];

    deltas.push(...this.extractPreferences(semantic, context, knowledge));
    deltas.push(...this.extractFacts(semantic, response, context, knowledge));
    deltas.push(...this.extractGoals(semantic, response, context, knowledge));
    deltas.push(...this.extractSummary(response));

    return deltas;
  }

  // ════════════════════════════════════════════════
  // 1. PREFERENCES — what the user likes / wants
  // ════════════════════════════════════════════════

  private extractPreferences(
    semantic: SemanticContext,
    context: AIContext,
    knowledge: IUserKnowledge,
  ): PreferenceLearnedDelta[] {
    const deltas: PreferenceLearnedDelta[] = [];

    for (const entity of semantic.entities ?? []) {
      // Location preference
      if (entity.type === "LOCATION" && entity.value) {
        if (!this.hasPreference(knowledge, "location", entity.value)) {
          deltas.push({
            kind: "PREFERENCE_LEARNED",
            data: {
              key: "location",
              value: entity.value,
              confidence: semantic.confidence,
              source: "user",
            },
            evidence: `User mentioned location "${entity.value}"`,
          });
        }
      }

      // Price / budget preference
      if (entity.type === "PRICE_RANGE" && entity.value) {
        if (!this.hasPreference(knowledge, "priceRange", entity.value)) {
          deltas.push({
            kind: "PREFERENCE_LEARNED",
            data: {
              key: "priceRange",
              value: entity.value,
              confidence: semantic.confidence,
              source: "user",
            },
            evidence: `User specified price range: ${JSON.stringify(entity.value)}`,
          });
        }
      }

      // Guest count (expressed as a constraint → preference)
      if (entity.type === "GUEST_COUNT" && entity.value) {
        deltas.push({
          kind: "PREFERENCE_LEARNED",
          data: {
            key: "guestCount",
            value: entity.value,
            confidence: 0.9,
            source: "user",
          },
          evidence: `User specified ${entity.value} guests`,
        });
      }
    }

    // Infer listing type preference from search result patterns
    const searchResults = context.resources.searchResults;
    if (searchResults && searchResults.length >= 2) {
      const types = searchResults
        .map((r: any) => r.type ?? r.listingType ?? r.category)
        .filter(Boolean);
      const unique = [...new Set(types)];
      if (unique.length === 1 && !this.hasPreference(knowledge, "listingType", unique[0])) {
        deltas.push({
          kind: "PREFERENCE_LEARNED",
          data: {
            key: "listingType",
            value: unique[0],
            confidence: 0.5,
            source: "behavior",
          },
          evidence: `All ${types.length} search results are type "${unique[0]}"`,
        });
      }
    }

    return deltas;
  }

  // ════════════════════════════════════════════════
  // 2. FACTS — concrete things we learned
  // ════════════════════════════════════════════════

  private extractFacts(
    semantic: SemanticContext,
    response: WisdomResponse,
    context: AIContext,
    knowledge: IUserKnowledge,
  ): FactLearnedDelta[] {
    const deltas: FactLearnedDelta[] = [];

    // Entity facts from semantic extraction
    for (const entity of semantic.entities ?? []) {
      const factKey = `${entity.type}:${entity.value}`;
      if (!this.hasFact(knowledge, factKey)) {
        deltas.push({
          kind: "FACT_LEARNED",
          data: {
            key: factKey,
            value: { type: entity.type, value: entity.value },
            confidence: semantic.confidence,
            createdAt: Date.now(),
            source: semantic.isRuleMatched ? "user" : "llm",
          },
          evidence: `Entity ${entity.type}="${entity.value}" extracted from user input`,
        });
      }
    }

    // Booking facts from artifacts
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

      // Listing facts from search results
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

    // Date range facts
    for (const entity of semantic.entities ?? []) {
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
    }

    return deltas;
  }

  // ════════════════════════════════════════════════
  // 3. GOALS — what the user is trying to achieve
  // ════════════════════════════════════════════════

  private extractGoals(
    semantic: SemanticContext,
    response: WisdomResponse,
    context: AIContext,
    knowledge: IUserKnowledge,
  ): GoalLearnedDelta[] {
    const deltas: GoalLearnedDelta[] = [];

    // Infer goal from domain + action
    const goalType = this.inferGoalType(semantic, response);
    if (!goalType) return deltas;

    const target = this.inferGoalTarget(semantic, context);
    const existingGoal = knowledge.goals.find(
      g => g.goalType === goalType && g.status !== "completed" && g.status !== "abandoned",
    );

    if (existingGoal) {
      // Update existing goal status if the agent completed something
      if (response.artifacts?.some(a => a.type === "BOOKING")) {
        existingGoal.status = "completed";
        existingGoal.confidence = 1.0;
      }
    } else {
      // New goal
      deltas.push({
        kind: "GOAL_LEARNED",
        data: {
          goalType,
          target,
          status: response.artifacts?.some(a => a.type === "BOOKING") ? "completed" : "active",
          createdAt: Date.now(),
          confidence: semantic.confidence,
        },
        evidence: `User intent: ${goalType} → ${target}`,
      });
    }

    return deltas;
  }

  // ════════════════════════════════════════════════
  // 4. SUMMARIES — compressed conversation chunks
  // ════════════════════════════════════════════════

  private extractSummary(response: WisdomResponse): SummaryCreatedDelta[] {
    // Only create a summary if the response has meaningful content
    if (!response.summary || response.summary.length < 10) return [];

    return [{
      kind: "SUMMARY_CREATED",
      data: {
        text: response.summary,
        createdAt: Date.now(),
        confidence: 0.7,
      },
      evidence: `Agent produced summary: "${response.summary.slice(0, 80)}..."`,
    }];
  }

  // ════════════════════════════════════════════════
  // HELPERS
  // ════════════════════════════════════════════════

  private hasPreference(knowledge: IUserKnowledge, key: string, value: any): boolean {
    return knowledge.preferences.some(
      p => p.key === key && JSON.stringify(p.value) === JSON.stringify(value),
    );
  }

  private hasFact(knowledge: IUserKnowledge, key: string): boolean {
    return knowledge.facts.some(f => f.key === key);
  }

  private inferGoalType(
    semantic: SemanticContext,
    response: WisdomResponse,
  ): string | null {
    const domain = semantic.domain;
    const action = semantic.action?.type;

    if (domain === "BOOKING") {
      if (action === "CREATE_BOOKING") return "book_accommodation";
      if (action === "CANCEL_BOOKING") return "cancel_booking";
      if (action === "GET_MY_BOOKINGS") return "manage_bookings";
    }
    if (domain === "LISTING") {
      if (action === "SEARCH_LISTING") return "find_accommodation";
      if (action?.startsWith("OPTIMIZE_")) return "optimize_listing";
    }

    // Check artifacts for goal inference
    if (response.artifacts?.some(a => a.type === "BOOKING")) {
      return "book_accommodation";
    }
    if (response.artifacts?.some(a => a.type === "LISTING_SEARCH_RESULT")) {
      return "find_accommodation";
    }

    return null;
  }

  private inferGoalTarget(semantic: SemanticContext, context: AIContext): string {
    // Location-based target
    const locationEntity = semantic.entities?.find(e => e.type === "LOCATION");
    if (locationEntity) return `accommodation in ${locationEntity.value}`;

    // Listing-based target
    if (context.resources.listingId) return `listing ${context.resources.listingId}`;

    // Generic
    return semantic.rawInput?.slice(0, 100) ?? "unknown";
  }
}
