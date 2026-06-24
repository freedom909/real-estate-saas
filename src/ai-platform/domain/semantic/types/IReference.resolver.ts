// reference/types/i-reference-resolver.ts

import { RuntimeContext } from "@/ai-platform/context/types/context/ai.context";
import { SemanticContext } from "../semantic-context";




export interface IReferenceResolver {
  resolve(
    semantic: SemanticContext,
    runtime: RuntimeContext
  ): Promise<SemanticContext>;
}