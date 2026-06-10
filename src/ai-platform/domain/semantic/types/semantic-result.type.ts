import { AIDomain } from "./ai.domain";

export interface SemanticResult {
  domain: AIDomain;

  facet?: string;

  intent: Intent;

  confidence: number;

  entities?: Record<string,any>;
}

export enum Intent {
  CANCEL_BOOKING =
    "CANCEL_BOOKING",

  REFUND =
    "REFUND",

  OPTIMIZE_TITLE =
    "OPTIMIZE_TITLE",

  OPTIMIZE_DESCRIPTION =
    "OPTIMIZE_DESCRIPTION",

  GENERAL ="GENERAL",
  CREATE_BOOKING = "CREATE_BOOKING"
}