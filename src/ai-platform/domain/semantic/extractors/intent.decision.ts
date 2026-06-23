//

import { AIDomain } from "../types/ai.domain";

export interface IntentDecision {
  matched: boolean;
  domain: AIDomain;
  action: string;
  confidence: number;
  reason: string;
}

export type Intent = {
  intent: string;

  domain: AIDomain;

  confidence: number;

};