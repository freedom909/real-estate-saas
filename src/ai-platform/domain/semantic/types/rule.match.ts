import { AIDomain } from "./ai.domain";

export interface RuleMatch {
  matched: boolean;
  intent?: string;
  domain?: AIDomain;
  action?: string;
  confidence: number;
  reason?: string;
}