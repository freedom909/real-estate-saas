import { IAIService, SecurityEvent } from "../types";

export class RiskEngine {
  constructor(private ai: IAIService) {}

  async evaluate(event: SecurityEvent): Promise<number> {
    let score = 0;

    if (event.failedAttempts > 5) score += 50;
    if (event.isNewDevice) score += 30;
    if (event.ipRisk) score += 40;

    const aiScore = await this.ai.analyzeRisk(event);

    return score + aiScore;
  }
}