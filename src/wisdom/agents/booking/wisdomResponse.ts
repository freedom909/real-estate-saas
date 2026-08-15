// src/wisdom/agents/booking/wisdomResponse.ts

import { Artifact } from "@/wisdom/memory/booking/artifact-transition-mapper";

export interface WisdomResponse {
  success: boolean;

  domain: string;

  primaryAction: {
    name: string;
    confidence: number;
  };

  summary: string;

  artifacts: Artifact[];

  voice?: unknown;
}