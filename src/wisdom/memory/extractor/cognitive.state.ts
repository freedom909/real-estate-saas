// src/wisdom/memory/extractor/cognitive.state.ts
//
// CognitiveState — the unified state object passed through the cognition pipeline.
// Combines perception, memory, and runtime context into a single snapshot.
// ────────────────────────────────────────────────────────────────────────

import { PerceptionResult } from "../type/percerption";
import { CognitiveSnapshot } from "../type/ICognitive.state";
import { IdentityContext, RuntimeContext } from "@/wisdom/contracts/ai-context";

/**
 * CognitiveState is the "world model" at a single point in time.
 *
 * It is constructed BEFORE an action executes (via MemoryExtractor.captureBefore)
 * and used as the baseline for delta detection after the action completes.
 *
 * Fields:
 *   - perception: What the system understood from the user's input
 *   - snapshot:   The full cognitive snapshot (entities, beliefs, resources)
 *   - identity:   Who is this user, what session are we in
 *   - runtime:    Device, locale, timezone, current flow
 */
export interface CognitiveState {
  /** What the system understood from the input */
  perception: PerceptionResult;

  /** The cognitive snapshot — entities, beliefs, resources, trajectory */
  snapshot: CognitiveSnapshot;

  /** Identity context — user, session, tenant */
  identity: IdentityContext;

  /** Runtime context — device, locale, timezone */
  runtime: RuntimeContext;
}
