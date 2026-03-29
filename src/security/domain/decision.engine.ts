import { RiskDecision } from "../shared/types";

export class DecisionEngine {
  decide(score: number): RiskDecision {
    if (score < 40) return "ALLOW";
    if (score < 80) return "CHALLENGE";
    return "BLOCK";
  }
}