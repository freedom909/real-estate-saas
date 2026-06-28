// src/wisdom/memory/store/handlers/goal.handler.ts
//
// Applies GOAL_UPDATED deltas — state machine with canTransition() guard.
//
// One active goal per goalType. Transitions:
//   pending → searching → candidate_selected → booking → completed
//                                                        ↘ abandoned
//
// ────────────────────────────────────────────────────────────────

import { injectable } from "tsyringe";
import { IUserKnowledge, GoalMemory } from "../../model/IUserKnowledge";
import { DeltaHandler } from "./delta-handler.interface";

const GOAL_ORDER = [
  "pending",
  "searching",
  "candidate_selected",
  "booking",
  "completed",
  "abandoned",
];

@injectable()
export class GoalHandler implements DeltaHandler {
  readonly kind = "GOAL_UPDATED" as const;

  apply(
    knowledge: IUserKnowledge,
    data: { goalType: string; target?: string; status: string; confidence?: number },
  ): void {
    const existing = knowledge.goals.find(
      (g) =>
        g.goalType === data.goalType &&
        g.status !== "completed" &&
        g.status !== "abandoned",
    );

    const now = Date.now();

    if (existing) {
      if (this.canTransition(existing.status, data.status)) {
        existing.status = data.status as GoalMemory["status"];
        existing.updatedAt = now;
        if (data.target) existing.target = data.target;
        if (data.confidence !== undefined) existing.confidence = data.confidence;
      }
    } else {
      knowledge.goals.push({
        goalType: data.goalType,
        target: data.target ?? "unknown",
        status: data.status as GoalMemory["status"],
        createdAt: now,
        updatedAt: now,
        confidence: data.confidence ?? 0.5,
      });
    }
  }

  private canTransition(from: string, to: string): boolean {
    if (to === "completed" || to === "abandoned") return true;
    return GOAL_ORDER.indexOf(to) >= GOAL_ORDER.indexOf(from);
  }
}
