import { AIDomain } from "./ai.domain";

export interface RuleMatch {
  matched: boolean;
  intent?: string;
  domain?: AIDomain;
  confidence: number;
  reason?: string;
}