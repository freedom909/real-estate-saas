// src/wisdom/memory/extractor/plugins/goal.plugin.ts
//
// Extracts goal state machine transitions.
//
// DESIGN RULES:
//   - NEVER creates duplicate goals. One active goal per goalType.
//   - Returns GOAL_UPDATED delta — the Store transitions the state.
//   - Pure function: no mutation of knowledge.goals[].
//
// State machine:
//   pending → searching → candidate_selected → booking → completed
//                                                          ↘ abandoned
//
// ────────────────────────────────────────────────────────────────

import { injectable } from "tsyringe";
import { SemanticContext } from "@/wisdom/semantic/semantic-context";
import { WisdomResponse } from "@/wisdom/contracts/response";
import { AIContext } from "@/wisdom/contracts/ai-context";
import { GoalUpdatedDelta } from "../../type/cognitiveDelta";
import { IUserKnowledge } from "../../model/IUserKnowledge";
import { KnowledgePlugin } from "./knowledge-plugin.interface";
import { ArtifactType } from "@/wisdom/shared/enums/artifact-type.enum";

@injectable()
export class GoalPlugin implements KnowledgePlugin {
  readonly name = "GoalPlugin";

  extract(
    semantic: SemanticContext,
    response: WisdomResponse,
    _context: AIContext,
    knowledge: IUserKnowledge,
  ): GoalUpdatedDelta[] {
    const deltas: GoalUpdatedDelta[] = [];

    const goalType = this.inferGoalType(semantic, response);
    if (!goalType) return deltas;

    const target = this.inferGoalTarget(semantic);
    const existingGoal = knowledge.goals.find(
      g => g.goalType === goalType && g.status !== "completed" && g.status !== "abandoned",
    );

    // Determine the new status based on what happened this turn
    const newStatus = this.inferGoalStatus(semantic, response, existingGoal?.status);

    if (existingGoal) {
      // Transition existing goal — pure delta, no mutation
      if (newStatus !== existingGoal.status) {
        deltas.push({
          kind: "GOAL_UPDATED",
          data: {
            goalType,
            target: target || undefined,
            status: newStatus,
            confidence: response.artifacts?.some(a => a.type === ArtifactType.BOOKING) ? 1.0 : semantic.confidence,
          },
          evidence: `Goal "${goalType}" transitioned: ${existingGoal.status} → ${newStatus}`,
        });
      }
    } else {
      // New goal — start at the inferred status
      deltas.push({
        kind: "GOAL_UPDATED",
        data: {
          goalType,
          target,
          status: newStatus,
          confidence: semantic.confidence,
        },
        evidence: `New goal: ${goalType} → ${target} [${newStatus}]`,
      });
    }

    return deltas;
  }

  // ════════════════════════════════════════════════
  // HELPERS
  // ════════════════════════════════════════════════

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

  private inferGoalTarget(semantic: SemanticContext): string {
    const locationEntity = semantic.entities?.find(e => e.type === "LOCATION");
    if (locationEntity) return `accommodation in ${locationEntity.value}`;
    return semantic.rawInput?.slice(0, 100) ?? "unknown";
  }

  /**
   * Infer the goal status based on what happened this turn.
   *
   * State machine:
   *   pending → searching → candidate_selected → booking → completed
   *                                                          ↘ abandoned
   */
  private inferGoalStatus(
    semantic: SemanticContext,
    response: WisdomResponse,
    currentStatus?: string,
  ): "pending" | "searching" | "candidate_selected" | "booking" | "completed" | "abandoned" {
    // If a booking was created, goal is completed
    if (response.artifacts?.some(a => a.type === "BOOKING")) {
      return "completed";
    }

    // If a cancel action, goal is abandoned
    if (semantic.action?.type === "CANCEL_BOOKING") {
      return "abandoned";
    }

    // If search results came back, we're at candidate_selected
    if (response.artifacts?.some(a => a.type === "LISTING_SEARCH_RESULT")) {
      // If user is selecting/booking, move to candidate_selected
      if (semantic.action?.type === "CREATE_BOOKING") {
        return "booking";
      }
      return "candidate_selected";
    }

    // If we're in a search domain, we're searching
    if (semantic.domain === "LISTING" || semantic.domain === "BOOKING") {
      // Progress from current state, never go backward
      switch (currentStatus) {
        case "candidate_selected":
        case "booking":
        case "completed":
          return currentStatus; // don't regress
        default:
          return "searching";
      }
    }

    return "pending";
  }
}
