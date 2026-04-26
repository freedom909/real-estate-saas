import { RiskContext } from "./riskContext";
import { RiskDecision } from "../types";

export class DecisionEngine {
  decide(score: number, ctx?: RiskContext): RiskDecision {
    if (process.env.NODE_ENV === "development") {
      return "ALLOW";
    }

    // 🛡️ 防御式编程（关键）
    if (!ctx) {
      console.warn("⚠️ ctx is undefined, fallback to ALLOW");
      return "ALLOW";
    }

    if (ctx.isNewDevice) score += 15;
    if (ctx.ipRisk) score += 30;
    if (ctx.failedAttempts > 3) score += 25;

    if (score < 50) return "ALLOW";
    if (score < 80) return "CHALLENGE";
    return "BLOCK";
  }
}
