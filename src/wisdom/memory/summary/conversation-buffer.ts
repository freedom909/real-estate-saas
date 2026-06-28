// src/wisdom/memory/summary/conversation-buffer.ts
//
// ConversationBuffer — accumulates conversation turns per session.
//
// This is the "raw material" for the SummaryPipeline.
// Each turn (user message + agent response) is buffered.
// When the buffer exceeds a threshold, SummaryScheduler triggers compression.
//
// ────────────────────────────────────────────────────────────────

import { injectable } from "tsyringe";
import { MemoryContext } from "../type/memory-context";

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  /** Optional metadata from the turn */
  metadata?: {
    domain?: string;
    action?: string;
    artifacts?: any[];
  };
}

@injectable()
export class ConversationBuffer {
  /** sessionId → turns[] */
  private buffers = new Map<string, ConversationTurn[]>();

  /** Max turns before triggering summary (configurable) */
  private readonly threshold: number;

  constructor(threshold = 20) {
    this.threshold = threshold;
  }

  /**
   * Add a turn to the buffer.
   * Returns true if the buffer has exceeded the threshold (needs summarization).
   */
  add(ctx: MemoryContext, turn: ConversationTurn): boolean {
   
    const turns = this.buffers.get(ctx.sessionId) ?? [];
     console.log("BEFORE", turns.length);
    turns.push(turn);
      console.log("AFTER", turns.length);
    this.buffers.set(ctx.sessionId, turns);
    console.log(this.buffers);
    return turns.length >= this.threshold;
  }

  /**
   * Get all buffered turns for a session.
   */
  getTurns(ctx: MemoryContext): ConversationTurn[] {
    return this.buffers.get(ctx.sessionId) ?? [];
  }

  /**
   * Check if the buffer needs summarization.
   */
  needsSummary(ctx: MemoryContext): boolean {
    const turns = this.buffers.get(ctx.sessionId) ?? [];
    return turns.length >= this.threshold;
  }

  /**
   * Clear the buffer (after summarization).
   * Optionally keep the last N turns as context for the next summary cycle.
   */
  clear(ctx: MemoryContext, keepLast = 5): void {
    const turns = this.buffers.get(ctx.sessionId) ?? [];
    if (keepLast > 0 && turns.length > keepLast) {
      this.buffers.set(ctx.sessionId, turns.slice(-keepLast));
    } else {
      this.buffers.delete(ctx.sessionId);
    }
  }

  /**
   * Get the buffer size for a session.
   */
  size(ctx: MemoryContext): number {
    return this.buffers.get(ctx.sessionId)?.length ?? 0;
  }
}
