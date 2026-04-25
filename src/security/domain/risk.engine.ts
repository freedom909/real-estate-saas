import { inject, injectable } from "tsyringe";
import { IAIService, SecurityEvent } from "../types";
import { TOKENS_SECURITY } from "../../modules/tokens/security.tokens";

@injectable()
export class RiskEngine {
  constructor(
    @inject(TOKENS_SECURITY.aiService)
    private ai: IAIService
  ) {}

  async evaluate(event: SecurityEvent): Promise<number> {
    let score = 0;

    if (event.failedAttempts > 50) score += 50;
    if (event.isNewDevice) score += 15;
    if (event.ipRisk) score += 40;

    const aiScore = await this.ai.analyzeRisk(event);

    return score + aiScore;
  }
}