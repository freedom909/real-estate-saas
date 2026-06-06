
import { SemanticContext } from "../semantic-context";
import { UserContext } from "./userContext";

// src/ai-platform/domain/semantic/types/IDomainAgent.ts
export interface IDomainAgent {
  execute(semantic: SemanticContext,user:UserContext): Promise<any>;
}