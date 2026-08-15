// src/wisdom/contracts/reference-resolver.ts

import { SemanticContext } from "../semantic/semantic-context";
import { AIContext } from "./ai-context";

export interface IListingReferenceResolver {
  resolve(
    semantic: SemanticContext,
    context: AIContext
  ): Promise<SemanticContext>;
}
