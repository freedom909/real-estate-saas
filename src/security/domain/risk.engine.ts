import { inject, injectable } from "tsyringe";
import { SecurityEvent } from "../types";

@injectable()
export class RiskEngine {
  constructor() {}

  async evaluate(event: SecurityEvent): Promise<number> {
    let score = 0;

    // Basic Rule Weights
    if (event.failedAttempts > 5) score += 25;
    if (event.isNewDevice) score += 15;
    if (event.ipRisk) score += 40;
    
    return score;
  }
}