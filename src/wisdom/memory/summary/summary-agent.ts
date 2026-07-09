// src/wisdom/memory/summary/summary-agent.ts
//
// SummaryAgent — compresses conversation turns into a concise summary via LLM.
//
// This is the "brain" of the SummaryPipeline.
// It takes raw conversation turns and produces a compressed summary
// that captures key facts, preferences, and decisions.
//
// ────────────────────────────────────────────────────────────────

import { inject, injectable } from "tsyringe";
import { WISDOM_TOKENS } from "../../container/tokens/wisdom.tokens";
import { OpenAITool } from "@/wisdom/tools/openai.tool";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { ConversationTurn } from "./conversation-buffer";

const SUMMARY_SYSTEM_PROMPT = `You are a conversation summarizer for a 民宿 (minshuku/customer) booking assistant.

Given a conversation between a user and the assistant, produce a concise summary that captures:
1. Key user preferences (location, price range, dates, Customer count, pet policy, etc.)
2. Important facts learned (specific listings discussed, booking confirmations, etc.)
3. Current goal state (what the user is trying to do)
4. Any decisions made or pending

Rules:
- Be concise (2-4 sentences max)
- Focus on actionable information for future turns
- Use bullet points if there are multiple distinct items
- Do NOT include pleasantries or filler
- Output plain text, no markdown`;

@injectable()
export class SummaryAgent {
  constructor(
    @inject(TOKENS_AI.OpenAITool)
    private openai: OpenAITool,
  ) {}

  /**
   * Summarize conversation turns into a compressed text.
   */
  async summarize(turns: ConversationTurn[]): Promise<string> {
    // Format turns into a conversation transcript
    const transcript = turns
      .map((t) => {
        const role = t.role === "user" ? "User" : "Assistant";
        return `${role}: ${t.content}`;
      })
      .join("\n");

    const prompt = `${SUMMARY_SYSTEM_PROMPT}\n\n---\n\nConversation:\n${transcript}\n\nSummary:`;

    try {
      const summary = await this.openai.generateText({ prompt });
      return summary || "Summary generation failed.";
    } catch (err) {
      console.error("❌ LLM summary generation failed:", err);
      // Fallback: simple extractive summary
      return this.fallbackSummary(turns);
    }
  }

  /**
   * Fallback summary when LLM is unavailable.
   * Just extracts the last user message and key metadata.
   */
  private fallbackSummary(turns: ConversationTurn[]): string {
    const lastUser = turns.filter((t) => t.role === "user").pop();
    const lastAssistant = turns.filter((t) => t.role === "assistant").pop();

    const parts: string[] = [];
    if (lastUser) parts.push(`Last request: ${lastUser.content}`);
    if (lastAssistant) parts.push(`Last response: ${lastAssistant.content}`);
    parts.push(`Total turns: ${turns.length}`);

    return parts.join(" | ");
  }
}
