// src/wisdom/memory/type/ICognitive.state.ts
//
// CognitiveState — the unified state object passed through the cognition pipeline.
// Combines perception, memory, and runtime context into a single snapshot.
//
// This is the "world model" at a single point in time.
// Used as the baseline for delta detection after an action executes.
// ────────────────────────────────────────────────────────────────

import { IdentityContext, RuntimeContext } from "@/wisdom/contracts/ai-context";
import { PerceptionResult } from "./percerption";
import { SessionMemory } from "./sessionMemory";
import { ISemanticMemory } from "../ISemantic.memory";
import { ILongTermStore } from "./ILongTermStore";

/**
 * Where the conversation is heading — trajectory detection.
 */
export type TrajectoryGoal =
  | "SEARCH_AND_BOOK"
  | "BOOKING_MANAGEMENT"
  | "EXPLORATION"
  | "INFORMATION_SEEKING"
  | "OPTIMIZATION"
  | "UNKNOWN";

export interface ConversationTrajectory {
  goal: TrajectoryGoal | null;
  turnCount: number;
  confidence: number;
}

/**
 * CognitiveSnapshot — a snapshot of everything the system "knows"
 * at a single point in time, BEFORE an action executes.
 *
 * This is the "Before State" in the delta detection chain:
 *   Before State → Execute Action → Observation → After State
 *                                              → detectDelta(before, after)
 */
export interface CognitiveSnapshot {
  beliefs: {
    /** Known entities (listing IDs, booking IDs, locations, etc.) */
    entities: Map<string, any>;
    /** Active booking draft (if any) */
    bookingDraft: Record<string, any> | null;
    /** Search results currently in working memory */
    searchResults: any[];
    /** User preferences observed so far */
    preferences: Record<string, any>;
    /** Conversation trajectory — where is this going? */
    trajectory: ConversationTrajectory;
  };
  resources: {
    listingIds: string[];
    bookingIds: string[];
    hasSearchResults: boolean;
    hasBookingDraft: boolean;
  };
  timestamp: number;
}

/**
 * ICognitiveState — the full cognitive state combining:
 *   - perception: What the system understood from the user's input
 *   - snapshot:   The cognitive snapshot (entities, beliefs, resources, trajectory)
 *   - identity:   Who is this user, what session are we in
 *   - runtime:    Device, locale, timezone, current flow
 *   - memory:     Session memory, long-term memory, semantic memory
 */
export interface ICognitiveState {
  /** What the system understood from the input */
  perception: PerceptionResult;

  /** The cognitive snapshot — entities, beliefs, resources, trajectory */
  snapshot: CognitiveSnapshot;

  /** Session memory (search results, booking draft, messages) */
  sessionMemory: SessionMemory;

  /** Long-term memory (preferences, history, summaries) */
  longTermMemory: ILongTermStore;

  /** Semantic memory entries */
  semanticMemory: ISemanticMemory[];

  /** Runtime context — device, locale, timezone */
  runtime: RuntimeContext;

  /** Identity context — user, session, tenant */
  identity: IdentityContext;
}
