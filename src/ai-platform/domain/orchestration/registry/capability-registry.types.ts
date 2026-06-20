import { AIDomain } from "@/ai-platform/domain/semantic/types/ai.domain";
import { Precondition, Effect } from "../state/world-state";

export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface CapabilityParameter {
  name: string;
  type: string;
  description?: string;
  schema?: string;
  entity?: string;
  field?: string;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
  retryOnErrors: string[];
}

export interface CapabilityRegistryEntry {
  id: string;
  domain: AIDomain;
  description: string;

  preconditions: Precondition[];
  effects: Effect[];

  inputs: CapabilityParameter[];
  outputs: CapabilityParameter[];

  executorId: string;
  compensation?: string[];
  tags?: string[];
  permissions?: string[];
  cost?: number;
  timeoutMs?: number;
  retry?: RetryPolicy;
  sideEffects?: string[];
  riskLevel?: RiskLevel;
}

export interface CapabilityRegistryMap {
  [key: string]: CapabilityRegistryEntry;
}
