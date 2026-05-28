import { Context } from "vm";
import { RiskContext } from "./domain/riskContext";

export type RiskDecision = "ALLOW" | "CHALLENGE" | "BLOCK";

export interface SecurityEvent extends RiskContext {
  userId: string;
  ip: string;
  userAgent: string;
  deviceId: string;
  failedAttempts: number;
  isNewDevice: boolean;
  ipRisk: boolean;
  locationChanged?: boolean;
  requestCount?: number;
  context?: RiskContext;
  timestamp?: Date;
}

export interface RiskResult {
  score: number;
  decision: RiskDecision;
}

export interface IAIService {
  analyzeRisk(event: SecurityEvent): Promise<number>;
}

export interface IAuditRepo {
  save(event: SecurityEvent): Promise<void>;
}