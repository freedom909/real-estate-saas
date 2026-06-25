// src/wisdom/contracts/reference-resolver.ts

import { SemanticContext } from "../semantic/semantic-context";
import { AIContext } from "./ai-context";

export interface IReferenceResolver {
  resolve(
    semantic: SemanticContext,
    context: AIContext
  ): Promise<SemanticContext>;
}
