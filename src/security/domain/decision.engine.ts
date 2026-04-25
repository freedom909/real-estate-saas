import { RiskDecision } from "../types";


export class DecisionEngine {
  decide(score: number): RiskDecision {
  if (process.env.NODE_ENV === "development") {
    return "ALLOW";
  }
    if (score < 50 ) return "ALLOW";
    if (score < 80) return "CHALLENGE";
    return "BLOCK";
  }
}

