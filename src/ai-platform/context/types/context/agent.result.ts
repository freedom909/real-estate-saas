// src/ai-platform/domain/types/context/agent.result.ts

import { AIDomain } from "@/ai-platform/domain/semantic/types/ai.domain";


export interface AgentResult {

  success: boolean;

  domain: AIDomain;

  primaryAction: AIAction;

  summary: string;

  artifacts: AgentArtifact[];

  metadata?: AgentMetadata;
}

export interface AgentArtifact {

  type: ArtifactType;

  content: Record<string, unknown>;
}

export interface AgentMetadata {

  durationMs?: number;

  model?: string;

  executedSteps?: string[];

  tokenUsage?: {

    prompt: number;

    completion: number;

    total: number;
  };
}

export enum ArtifactType {
  TITLE = "TITLE",
  DESCRIPTION = "DESCRIPTION",
  SEO = "SEO",
  BOOKING = "BOOKING",
  REVIEW = "REVIEW",
  PRICE = "PRICE",
  TIPS = "TIPS"
}

export interface AIAction {

  name: string;

  confidence: number;
}