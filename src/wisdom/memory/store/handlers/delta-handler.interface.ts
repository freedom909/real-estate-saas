// src/wisdom/memory/store/handlers/delta-handler.interface.ts
//
// DeltaHandler — strategy pattern for applying a specific delta kind to knowledge.
//
// Each handler is responsible for ONE delta kind.
// KnowledgeStore dispatches to the correct handler via a kind→handler map.
//
// Adding a new memory type:
//   1. Add delta kind to KnowledgeDeltaKind union
//   2. Add memory array to IUserKnowledge
//   3. Create a handler implementing this interface
//   4. Register it under DELTA_HANDLER_TOKEN
//   Done. Store picks it up automatically.
//
// ────────────────────────────────────────────────────────────────

import { IUserKnowledge } from "../../model/IUserKnowledge";
import { KnowledgeDeltaKind } from "../../type/cognitiveDelta";

export interface DeltaHandler {
  /** The delta kind this handler applies */
  readonly kind: KnowledgeDeltaKind;

  /** Apply this delta to the knowledge object (mutates knowledge in-place) */
  apply(knowledge: IUserKnowledge, data: unknown): void;
}
