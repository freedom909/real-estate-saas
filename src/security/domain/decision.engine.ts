import dotenv from "dotenv";
dotenv.config();
import { RiskContext } from "./riskContext";
import { RiskDecision } from "../types";
console.log("ENV:", process.env.NODE_ENV)
export class DecisionEngine {
  decide(score: number, ctx?: RiskContext): RiskDecision {
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev" || !process.env.NODE_ENV) {
      return "ALLOW";
    }

    // 🛡️ 防御式编程（关键）
    if (!ctx) {
      console.warn("⚠️ ctx is undefined, fallback to ALLOW");
      return "ALLOW";
    }
console.log("score:", score);

    if (ctx.isNewDevice) score += 15;
    if (ctx.ipRisk) score += 30;
    if (ctx.failedAttempts > 3) score += 25;

    if (score < 50) return "ALLOW"; // 提高 ALLOW 的阈值，让一般风险事件也能顺利通过
    if (score < 75) return "CHALLENGE"; // 减少拦截频率
    console.log("ctx:", ctx);
    return "BLOCK";
  }
}
