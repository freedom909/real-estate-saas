
import { AIContext } from "../../types/context/aiContext";
import { SemanticContext } from "../semantic-context";


// src/ai-platform/domain/semantic/types/IDomainAgent.ts
export interface IDomainAgent {
  execute(semantic: SemanticContext,context:AIContext): Promise<any>;
}