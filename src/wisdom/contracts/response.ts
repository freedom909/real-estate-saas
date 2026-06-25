// src/wisdom/contracts/response.ts

import { AIDomain } from "../shared/enums/domain.enum";
import { ArtifactType } from "../shared/enums/artifact-type.enum";

export interface WisdomResponse {
  success: boolean;
  domain: AIDomain;
  primaryAction: {
    name: string;
    confidence: number;
  };
  summary: string;
  artifacts: WisdomArtifact[];
  metadata?: WisdomMetadata;
}

export interface WisdomArtifact {
  type: ArtifactType;
  content: Record<string, unknown>;
}

export interface WisdomMetadata {
  durationMs?: number;
  model?: string;
  executedSteps?: string[];
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}
