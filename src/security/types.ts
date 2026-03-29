export type RiskDecision = "ALLOW" | "CHALLENGE" | "BLOCK";

export interface SecurityEvent {
  userId: string;
  ip: string;
  userAgent: string;
  deviceId: string;
  failedAttempts: number;
  isNewDevice: boolean;
  ipRisk: boolean;
  locationChanged?: boolean;
  requestCount?: number;
}

export interface RiskResult {
  score: number;
  decision: RiskDecision;
}

export interface IAIService {
  analyzeRisk(event: SecurityEvent): Promise<number>;
}

export interface IAuditRepo {
  save(event: any): Promise<void>;
}