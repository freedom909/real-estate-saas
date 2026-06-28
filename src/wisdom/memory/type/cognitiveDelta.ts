// src/wisdom/memory/type/cognitiveDelta.ts
//
// Knowledge Delta — the output of the Knowledge Extractor pipeline.
//
// 5 kinds of knowledge (Summary is async, not per-turn):
//
//   PreferenceLearned  — what the user prefers (location, price, type)
//   FactLearned        — a fact about the world (entity details, bookings)
//   GoalUpdated        — goal state machine transition (no duplicates)
//   BehaviorLearned    — user behavior patterns (search refinement, etc.)
//   SummaryCreated     — async conversation summary (NOT extracted per-turn)
//
// ────────────────────────────────────────────────────────────────

import {
  PreferenceMemory,
  FactMemory,
  GoalMemory,
  ConversationSummary,
  IUserKnowledge,
} from "../model/IUserKnowledge";
import { MemoryContext } from "./memory-context";

// ── Goal State Machine ──
// Goals are NOT created per-turn. They transition through states:
//
//   pending → searching → candidate_selected → booking → completed
//                                                           ↘ abandoned
export type GoalStatus =
  | "pending"
  | "searching"
  | "candidate_selected"
  | "booking"
  | "completed"
  | "abandoned";

// ── Delta Kind (exhaustive union) ──

export type KnowledgeDeltaKind =
  | "PREFERENCE_LEARNED"
  | "FACT_LEARNED"
  | "GOAL_UPDATED"
  | "BEHAVIOR_LEARNED"
  | "SUMMARY_CREATED";

// ── Change payloads (discriminated by kind) ──

export interface PreferenceLearnedDelta {
  kind: "PREFERENCE_LEARNED";
  data: PreferenceMemory;
  /** Why we believe this is a real preference (not noise) */
  evidence: string;
}

export interface FactLearnedDelta {
  kind: "FACT_LEARNED";
  data: FactMemory;
  evidence: string;
}

/**
 * GoalUpdatedDelta — pure delta for goal state transitions.
 *
 * If a goal with this goalType already exists, the Store transitions it.
 * If not, the Store creates it with the given status.
 *
 * Extractor NEVER mutates GoalMemory directly.
 */
export interface GoalUpdatedDelta {
  kind: "GOAL_UPDATED";
  data: {
    goalType: string;
    target?: string;
    status: GoalStatus;
    confidence?: number;
  };
  evidence: string;
}

export interface BehaviorLearnedDelta {
  kind: "BEHAVIOR_LEARNED";
  data: {
    key: string;
    value: unknown;
    confidence: number;
  };
  evidence: string;
}

export interface SummaryCreatedDelta {
  kind: "SUMMARY_CREATED";
  data: ConversationSummary;
  evidence: string;
}

// ── Union type ──

export type KnowledgeDelta =
  | PreferenceLearnedDelta
  | FactLearnedDelta
  | GoalUpdatedDelta
  | BehaviorLearnedDelta
  | SummaryCreatedDelta;

// ── Store interface ──

export interface IKnowledgeStore {
  /** Apply knowledge deltas to long-term memory */
  persist(ctx: MemoryContext, deltas: KnowledgeDelta[]): Promise<void>;
  /** Load all knowledge for a user */
  load(ctx: MemoryContext): Promise<IUserKnowledge>;
}
