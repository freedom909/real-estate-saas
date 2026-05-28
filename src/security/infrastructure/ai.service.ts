import { IAIService, SecurityEvent } from "../types";

export class MockAIService implements IAIService {
  async analyzeRisk(event: SecurityEvent): Promise<number> {
    // 模拟 AI 风控
    if (event.ip === "1.1.1.1") return 50;
    return 10;
  }
}