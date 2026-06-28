// src/wisdom/memory/model/IUserKnowledge.ts
//
// IUserKnowledge — the shape of long-term user knowledge.
//
// Each array is populated by a specific delta kind:
//   preferences[]  ← PREFERENCE_LEARNED
//   facts[]        ← FACT_LEARNED
//   goals[]        ← GOAL_UPDATED (state machine, one active per goalType)
//   summaries[]    ← SUMMARY_CREATED (async, not per-turn)
//
// ────────────────────────────────────────────────────────────────

export interface IUserKnowledge {
  preferences: PreferenceMemory[];
  facts: FactMemory[];
  goals: GoalMemory[];
  summaries: ConversationSummary[];
}

// ── Preference: what the user likes / wants ──

export interface PreferenceMemory {
  key: string;
  value: unknown;
  confidence: number;
  source?: "user" | "behavior" | "llm";
  createdAt?: number;
}

// ── Fact: concrete things we learned ──

export interface FactMemory {
  key: string;
  value: unknown;
  confidence: number;
  createdAt: number;
  source: "user" | "behavior" | "llm";
}

// ── Goal: state machine, one active per goalType ──
//
// Goals are NOT accumulated. There is ONE goal per goalType,
// and it transitions through states:
//
//   pending → searching → candidate_selected → booking → completed
//                                                           ↘ abandoned
//
// The Store applies GOAL_UPDATED deltas to transition the state.
// The Extractor never mutates GoalMemory.

export interface GoalMemory {
  goalType: string;
  target: string;
  status: "pending" | "searching" | "candidate_selected" | "booking" | "completed" | "abandoned";
  createdAt: number;
  updatedAt: number;
  confidence: number;
}

// ── Summary: compressed conversation chunk ──
//
// Summaries are generated asynchronously (not per-turn).
// A SummaryPipeline periodically compresses conversation history.

export interface ConversationSummary {
  text: string;
  createdAt: number;
  confidence: number;
}
