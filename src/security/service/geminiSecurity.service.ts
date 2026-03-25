// src/security/service/geminiSecurity.service.ts

import { injectable } from "tsyringe";
import { SecurityAssessment } from "../../domain/user/types/types";

@injectable()
export class GeminiSecurityService {
  constructor() {}
  private apiKey = process.env.GEMINI_API_KEY!;
  private model = "gemini-1.5-flash";

  async analyze(event: any): Promise<SecurityAssessment> {
    const prompt = this.buildPrompt(event);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return this.parseResponse(text);
  }

  // 🔥 Prompt Engineering（核心）
  private buildPrompt(event: any): string {
    return `
You are a cybersecurity risk analysis engine.

Analyze the following event and return a JSON response.

Event:
${JSON.stringify(event, null, 2)}

Rules:
- Evaluate risk from 0 to 1
- Consider IP anomaly, device change, unusual behavior
- Suggest one action: ALLOW, FLAG, CHALLENGE, BLOCK

Return ONLY JSON:
{
  "riskScore": number,
  "suggestedAction": "ALLOW" | "FLAG" | "CHALLENGE" | "BLOCK",
  "reason": string
}
`;
  }

  // 🔥 安全解析（必须做）
  private parseResponse(text: string): SecurityAssessment {
    try {
      const json = JSON.parse(text);

      return {
        riskScore: Math.min(Math.max(json.riskScore, 0), 1),
        suggestedAction: json.suggestedAction,
        reason: json.reason,
      };
    } catch (e) {
      // ❗ AI 出错 fallback（非常重要）
      return {
        riskScore: 0.5,
        suggestedAction: "FLAG",
        reason: "AI_PARSE_ERROR",
      };
    }
  }
}