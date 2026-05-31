// src/ai-platform/cognition/domain/agents/types/i-domain.agent.ts

import { SemanticContext } from "../../semantic/semantic-context";


export interface IDomainAgent {
 execute(
    semantic: SemanticContext
  ): Promise<any>;

}