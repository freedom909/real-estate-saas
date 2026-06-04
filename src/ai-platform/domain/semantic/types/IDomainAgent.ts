import { UserContext } from "../../types/enums/chat.response";
import { SemanticContext } from "../semantic-context";

// src/ai-platform/domain/semantic/types/IDomainAgent.ts
export interface IDomainAgent {
  execute(semantic: SemanticContext,user:UserContext): Promise<any>;
}