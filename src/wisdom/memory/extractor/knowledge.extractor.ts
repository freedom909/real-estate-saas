// src/wisdom/memory/extractor/knowledge.extractor.ts
//
// KnowledgeExtractor — thin orchestrator that delegates to plugins.
//
// Pipeline:
//   SemanticContext + WisdomResponse + PreviousKnowledge
//         │
//         ▼
//   for each KnowledgePlugin:
//     deltas.push(...plugin.extract(...))
//         │
//         ▼
//   KnowledgeDelta[]
//         │
//         ▼
//   KnowledgeStore.persist()
//
// DESIGN RULES:
//   1. This class does NO extraction itself — plugins do all the work.
//   2. Adding a new memory type = create a plugin + register it. No changes here.
//   3. Plugins are pure functions: given inputs, produce deltas. No side effects.
//
// ────────────────────────────────────────────────────────────────

import { injectable, injectAll, inject } from "tsyringe";
import { SemanticContext } from "@/wisdom/semantic/semantic-context";
import { WisdomResponse } from "@/wisdom/contracts/response";
import { AIContext } from "@/wisdom/contracts/ai-context";
import { KnowledgeDelta } from "../type/cognitiveDelta";
import { IUserKnowledge } from "../model/IUserKnowledge";
import { KnowledgePlugin } from "./plugins/knowledge-plugin.interface";

// DI token for plugin registration
export const KNOWLEDGE_PLUGIN_TOKEN = Symbol.for("wisdom.knowledgePlugin");

@injectable()
export class KnowledgeExtractor {
  constructor(
    @injectAll(KNOWLEDGE_PLUGIN_TOKEN)
    private plugins: KnowledgePlugin[],
  ) {}

  /**
   * Extract all knowledge deltas from a single conversation turn.
   * Delegates to all registered plugins.
   */
  extract(
    semantic: SemanticContext,
    response: WisdomResponse,
    context: AIContext,
    knowledge: IUserKnowledge,
  ): KnowledgeDelta[] {
    const deltas: KnowledgeDelta[] = [];

    for (const plugin of this.plugins) {
      const pluginDeltas = plugin.extract(semantic, response, context, knowledge);
      if (pluginDeltas.length > 0) {
        console.log(`  🧩 ${plugin.name} extracted ${pluginDeltas.length} delta(s)`);
      }
      deltas.push(...pluginDeltas);
    }

    return deltas;
  }
}
