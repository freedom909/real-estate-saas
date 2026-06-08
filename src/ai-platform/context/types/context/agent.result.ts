import { AIContext } from "./aiContext";

// src/ai-platform/domain/types/context/agent.result.ts
export interface AgentResult {

  success: boolean;

  domain: string;

  primaryAction: string;

  actions: string[];

  summary: string;

  artifacts: AgentArtifact[];

  metadata?: AgentMetadata;
}

export interface AgentArtifact {

  type: string;

  content: unknown;
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