// security/domain/entities/services/riskCalculator.ts


import { inject, injectable } from "tsyringe";
import { SecurityEvent } from "../types";


@injectable()
export default class RiskCalculator {
  calculate(event: SecurityEvent): {
    score: number;
    severity: "LOW" | "MEDIUM" | "HIGH";
    reasons: string[];
  } {
    let score = 0;
    const reasons: string[] = [];

    // 🧠 1. IP 风险
    if (this.isSuspiciousIP(event.ip)) {
      score += 40;
      reasons.push("Suspicious IP");
    }

    // 🧠 2. 匿名用户
    if (!event.userId || event.userId === "anonymous") {
      score += 20;
      reasons.push("Anonymous user");
    }

    // 🧠 3. 高频请求（简单版）
    if (event.requestCount && event.requestCount > 10) {
      score += 30;
      reasons.push("Too many requests");
    }

    // 🧠 4. User-Agent 异常
    if (this.isBot(event.userAgent)) {
      score += 25;
      reasons.push("Bot detected");
    }

    // 🧠 5. 地域异常（示例）
    if (event.locationChanged) {
      score += 35;
      reasons.push("Location changed");
    }

    // 🎯 限制最大值
    if (score > 100) score = 100;

    return {
      score,
      severity: this.getSeverity(score),
      reasons,
    };
  }

  // -----------------------
  // helper methods
  // -----------------------

  private getSeverity(score: number): "LOW" | "MEDIUM" | "HIGH" {
    if (score >= 70) return "HIGH";
    if (score >= 40) return "MEDIUM";
    return "LOW";
  }

  private isSuspiciousIP(ip: string): boolean {
    const blacklist = ["1.1.1.1", "2.2.2.2"];
    return blacklist.includes(ip);
  }

  private isBot(userAgent: string): boolean {
    if (!userAgent) return true;
    return userAgent.toLowerCase().includes("bot");
  }
}