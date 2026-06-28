// src/wisdom/memory/summary/summary-scheduler.ts
//
// SummaryScheduler — decides WHEN to trigger summarization.
//
// Strategy:
//   - After each turn, check if buffer exceeds threshold
//   - If yes, trigger SummaryAgent asynchronously (fire-and-forget)
//   - The orchestrator does NOT wait for summarization
//
// This keeps the per-turn pipeline fast. Summaries are a background process.
//
// ────────────────────────────────────────────────────────────────

import { inject, injectable } from "tsyringe";
import { WISDOM_TOKENS } from "../../container/tokens/wisdom.tokens";
import { ConversationBuffer, ConversationTurn } from "./conversation-buffer";
import { SummaryAgent } from "./summary-agent";
import { KnowledgeStore } from "../knowledge.store";
import { MemoryContext } from "../type/memory-context";

@injectable()
export class SummaryScheduler {
  constructor(
    @inject(WISDOM_TOKENS.memory.conversationBuffer)
    private buffer: ConversationBuffer,
    @inject(WISDOM_TOKENS.memory.summaryAgent)
    private summaryAgent: SummaryAgent,
    @inject(WISDOM_TOKENS.memory.knowledgeStore)
    private knowledgeStore: KnowledgeStore,
  ) {
     console.log("this.buffer", this.buffer);
  }

  /**
   * Called after each turn. Checks if summarization is needed.
   * If yes, fires off summarization asynchronously (does not block the response).
   */
  async onTurnComplete(
    ctx: MemoryContext,
    turn: ConversationTurn,
  ): Promise<void> {
    const needsSummary = this.buffer.add(ctx, turn);

    if (needsSummary) {
      // Fire and forget — don't await, don't block the response
      this.summarize(ctx).catch((err) => {
        console.error("❌ Background summarization failed:", err);
      });
    }
  }

  /**
   * Trigger summarization for a session.
   * This runs asynchronously and persists the summary via KnowledgeStore.
   */
  private async summarize(ctx: MemoryContext): Promise<void> {
    const turns = this.buffer.getTurns(ctx);
    if (turns.length === 0) return;

    console.log(`📝 Summarizing ${turns.length} turns for session ${ctx.sessionId}`);

    // Generate summary via LLM
    const summary = await this.summaryAgent.summarize(turns);

    // Persist as a SUMMARY_CREATED delta
    await this.knowledgeStore.persist(ctx, [
      {
        kind: "SUMMARY_CREATED",
        data: {
          text: summary,
          createdAt: Date.now(),
          confidence: 0.8,
        },
        evidence: `Auto-summarized ${turns.length} turns`,
      },
    ]);

    // Clear the buffer (keep last 5 turns as context)
    this.buffer.clear(ctx, 5);

    console.log(`✅ Summary persisted for session ${ctx.sessionId}`);
  }
}
