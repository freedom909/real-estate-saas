// src/wisdom/memory/extractor/plugins/knowledge-plugin.interface.ts
//
// KnowledgePlugin — the extension point for knowledge extraction.
//
// Each plugin is a pure function: given inputs, produce deltas.
// No side effects, no state mutation.
//
// To add a new memory type:
//   1. Create a class implementing this interface
//   2. Register it in wisdom.register.ts
//   3. KnowledgeExtractor picks it up automatically via DI
//
// ────────────────────────────────────────────────────────────────

import { SemanticContext } from "@/wisdom/semantic/semantic-context";
import { WisdomResponse } from "@/wisdom/contracts/response";
import { AIContext } from "@/wisdom/contracts/ai-context";
import { KnowledgeDelta } from "../../type/cognitiveDelta";
import { IUserKnowledge } from "../../model/IUserKnowledge";

export interface KnowledgePlugin {
  /** Unique name for logging and debugging */
  readonly name: string;

  /**
   * Extract knowledge deltas from a single conversation turn.
   *
   * @param semantic  — what the system understood from user input
   * @param response  — what the agent produced
   * @param context   — the full AI context (identity, resources)
   * @param knowledge — existing long-term knowledge (read-only, for dedup)
   * @returns KnowledgeDelta[] — new knowledge worth persisting
   */
  extract(
    semantic: SemanticContext,
    response: WisdomResponse,
    context: AIContext,
    knowledge: IUserKnowledge,
  ): KnowledgeDelta[];
}
