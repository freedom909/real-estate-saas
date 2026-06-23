//

import { AIDomain } from "../types/ai.domain";

export interface IntentDecision {
  matched: boolean;
  domain: AIDomain;
  primaryAction: string;
  confidence: number;
  reason: string;
}

export type Intent = {
  intent: string;

  domain: AIDomain;

  confidence: number;

};