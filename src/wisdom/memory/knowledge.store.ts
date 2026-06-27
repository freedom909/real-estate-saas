// src/wisdom/memory/knowledge.store.ts
//
// KnowledgeStore — persists KnowledgeDeltas to long-term memory.
//
// Each delta kind maps to an array in IUserKnowledge:
//   PREFERENCE_LEARNED → knowledge.preferences[]
//   FACT_LEARNED       → knowledge.facts[]
//   GOAL_LEARNED       → knowledge.goals[]
//   SUMMARY_CREATED    → knowledge.summaries[]
//
// This is the write side. The read side is MemoryManager.load().
//
// ────────────────────────────────────────────────────────────────

import { inject, injectable } from "tsyringe";
import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";
import { ILongTermStore } from "./type/ILongTermStore";
import {
  KnowledgeDelta,
  IKnowledgeStore,
} from "./type/cognitiveDelta";
import { IUserKnowledge } from "./model/IUserKnowledge";

const EMPTY_KNOWLEDGE: IUserKnowledge = {
  preferences: [],
  facts: [],
  goals: [],
  summaries: [],
};

@injectable()
export class KnowledgeStore implements IKnowledgeStore {
  constructor(
    @inject(WISDOM_TOKENS.memory.longTermStore)
    private longTermStore: ILongTermStore,
  ) {}

  /**
   * Persist a batch of knowledge deltas.
   * Loads existing knowledge, appends new entries, saves back.
   */
  async persist(userId: string, deltas: KnowledgeDelta[]): Promise<void> {
    if (deltas.length === 0) return;

    const existing = await this.longTermStore.get(userId);
    const knowledge: IUserKnowledge = existing?.knowledge ?? { ...EMPTY_KNOWLEDGE };

    for (const delta of deltas) {
      switch (delta.kind) {
        case "PREFERENCE_LEARNED":
          knowledge.preferences.push(delta.data);
          break;

        case "FACT_LEARNED":
          knowledge.facts.push(delta.data);
          break;

        case "GOAL_LEARNED":
          // If there's an active goal of the same type, update it
          const existingGoal = knowledge.goals.find(
            g => g.goalType === delta.data.goalType && g.status === "active",
          );
          if (existingGoal) {
            existingGoal.target = delta.data.target;
            existingGoal.status = delta.data.status;
            existingGoal.confidence = delta.data.confidence;
          } else {
            knowledge.goals.push(delta.data);
          }
          break;

        case "SUMMARY_CREATED":
          knowledge.summaries.push(delta.data);
          // Keep only the last 20 summaries to bound memory
          if (knowledge.summaries.length > 20) {
            knowledge.summaries = knowledge.summaries.slice(-20);
          }
          break;
      }
    }

    await this.longTermStore.set(userId, {
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
  async load(userId: string): Promise<IUserKnowledge> {
    const existing = await this.longTermStore.get(userId);
    return existing?.knowledge ?? { ...EMPTY_KNOWLEDGE };
  }
}
