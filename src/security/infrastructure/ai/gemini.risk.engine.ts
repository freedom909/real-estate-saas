// security/infrastructure/ai/gemini.risk.engine.ts

import { injectable, inject } from "tsyringe";
import { IAiRiskEngine } from "../../domain/ai.risk.engine";
import { GeminiClient } from "./gemini.client";

@injectable()
export class GeminiRiskEngine implements IAiRiskEngine {
  constructor(
    @inject("GeminiClient")
    private client: GeminiClient
  ) {}

  async evaluate(input: any) {
    const prompt = `
You are a security risk engine.

Evaluate risk:
- IP: ${input.ip}
- Device: ${input.deviceId}
- UserAgent: ${input.userAgent}
- Context: ${JSON.stringify(input.context)}

Return JSON:
{ "score": number (0-100), "reason": string }
`;

    const res = await this.client.analyze(prompt);

    try {
      const text = res.candidates?.[0]?.content?.parts?.[0]?.text;
      return JSON.parse(text);
    } catch {
      return { score: 50, reason: "fallback" };
    }
  }
}