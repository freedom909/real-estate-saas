//

import { AIDomain } from "../types/ai.domain";



export type IntentDecision = {

  matched: boolean;

  intents: Intent[];

  confidence: number;

};

export type Intent = {

  intent: string;

  domain: AIDomain;

  confidence: number;

};