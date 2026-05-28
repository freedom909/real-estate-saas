// security/domain/ai.risk.engine.ts

export interface IAiRiskEngine {
  evaluate(input: {
    userId: string;
    ip?: string;
    deviceId?: string;
    userAgent?: string;
    context: any;
  }): Promise<{
    score: number;
    reason?: string;
  }>;
}