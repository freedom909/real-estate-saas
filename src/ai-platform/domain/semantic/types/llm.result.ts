// src/ai-platform/domain/semantic/types/llm.result.ts

import { AIDomain } from "./ai.domain";


export interface LLMResult {
  intent: string;
  domain: AIDomain;
  confidence: number;
}