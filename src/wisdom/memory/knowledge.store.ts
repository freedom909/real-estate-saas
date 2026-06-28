// src/wisdom/memory/knowledge.store.ts
//
// KnowledgeStore — dispatcher that applies KnowledgeDeltas to long-term memory.
//
// DESIGN:
//   - Store is a thin dispatcher: kind → handler.apply(delta.data)
//   - Each DeltaHandler is responsible for ONE delta kind
//   - Adding a new memory type = new handler + register under DELTA_HANDLER_TOKEN
//   - No switch/case — the map IS the dispatch
//
// RULES:
//   1. Only the Store modifies knowledge. Extractors are pure.
//   2. Handlers mutate knowledge in-place (they own the mutation logic)
//   3. Store owns the load/save lifecycle
//
// ────────────────────────────────────────────────────────────────

import { inject, injectable, injectAll } from "tsyringe";
import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";
import { ILongTermStore } from "./type/ILongTermStore";
import {
  KnowledgeDelta,
  KnowledgeDeltaKind,
  IKnowledgeStore,
} from "./type/cognitiveDelta";
import { IUserKnowledge } from "./model/IUserKnowledge";
import { DeltaHandler } from "./store/handlers/delta-handler.interface";
import { MemoryContext } from "./type/memory-context";

const EMPTY_KNOWLEDGE: IUserKnowledge = {
  preferences: [],
  facts: [],
  goals: [],
  summaries: [],
};

@injectable()
export class KnowledgeStore implements IKnowledgeStore {
  /** kind → handler dispatch map, built once from injected handlers */
  private readonly handlers: Map<KnowledgeDeltaKind, DeltaHandler>;

  constructor(
    @inject(WISDOM_TOKENS.memory.longTermStore)
    private longTermStore: ILongTermStore,
    @injectAll(WISDOM_TOKENS.memory.deltaHandlers)
    private handlerList: DeltaHandler[],
  ) {
    // Build the dispatch map
    this.handlers = new Map();
    for (const handler of handlerList) {
      this.handlers.set(handler.kind, handler);
    }
  }

  /**
   * Apply a batch of knowledge deltas.
   * Loads existing knowledge, dispatches each delta to its handler, saves back.
   */
  async persist(ctx: MemoryContext, deltas: KnowledgeDelta[]): Promise<void> {
    if (deltas.length === 0) return;

    const existing = await this.longTermStore.get(ctx.userId);
    const knowledge: IUserKnowledge = existing?.knowledge ?? { ...EMPTY_KNOWLEDGE };

    for (const delta of deltas) {
      const handler = this.handlers.get(delta.kind);
      if (handler) {
        handler.apply(knowledge, delta.data);
      }
      // Unknown delta kinds are silently ignored (forward-compatible)
    }

    await this.longTermStore.set(ctx.userId, {
      knowledge,
      metadata: {
        createdAt: existing?.metadata?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
        version: (existing?.metadata?.version ?? 0) + 1,
      },
    });
  }

  /**
   * Load all knowledge for a user.
   */
  async load(ctx: MemoryContext): Promise<IUserKnowledge> {
    const existing = await this.longTermStore.get(ctx.userId);
    return existing?.knowledge ?? { ...EMPTY_KNOWLEDGE };
  }
}
