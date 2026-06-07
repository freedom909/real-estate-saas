//src/ai-platform/domain/semantic/types/IContextMemoryOrchestrator.ts

import { AIRequest } from "../../types/context/aiContext";
import { SemanticContext } from "../semantic-context";

export interface IContextMemoryOrchestrator {

  enrich(
    request: AIRequest,
    semantic: SemanticContext
  ): Promise<EnrichedContext>;

}

export interface EnrichedContext {

  request: AIRequest;

  semantic: SemanticContext;

}