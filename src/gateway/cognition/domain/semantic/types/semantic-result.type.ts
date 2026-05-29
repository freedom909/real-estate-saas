import { AIDomain } from "../../../../../shared/enums/ai-domain.enum";
import { Intent } from "../../../../../shared/enums/intent.enum";

export interface SemanticResult {
  domain: AIDomain;

  facet?: string;

  intent: Intent;

  confidence: number;
}