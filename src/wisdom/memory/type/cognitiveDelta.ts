// src/wisdom/memory/type/cognitiveDelta.ts
//
// Knowledge Delta — the output of the KnowledgeExtractor.
//
// A delta represents one piece of knowledge extracted from the
// conversation turn. There are exactly 4 kinds:
//
//   PreferenceLearned  — what the user prefers (location, price, type)
//   FactLearned        — a fact about the world (entity details, relationships)
//   GoalLearned        — what the user is trying to achieve
//   SummaryCreated     — a summarized chunk of conversation history
//
// Each delta maps directly to an entry in the knowledge store:
//   delta → KnowledgeStore[kind][]
//
// ────────────────────────────────────────────────────────────────

import {
  PreferenceMemory,
  FactMemory,
  GoalMemory,
  ConversationSummary,
  IUserKnowledge,
} from "../model/IUserKnowledge";

// ── Delta Kind (exhaustive union) ──

export type KnowledgeDeltaKind =
  | "PREFERENCE_LEARNED"
  | "FACT_LEARNED"
  | "GOAL_LEARNED"
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

export interface GoalLearnedDelta {
  kind: "GOAL_LEARNED";
  data: GoalMemory;
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
  | GoalLearnedDelta
  | SummaryCreatedDelta;

// ── Store interface ──

export interface IKnowledgeStore {
  /** Append knowledge deltas to long-term memory */
  persist(userId: string, deltas: KnowledgeDelta[]): Promise<void>;
  /** Load all knowledge for a user */
  load(userId: string): Promise<IUserKnowledge>;
}
