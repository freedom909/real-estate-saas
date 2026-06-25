// src/wisdom/contracts/agent.ts

import { SemanticContext } from "../semantic/semantic-context";
import { AIContext } from "./ai-context";
import { WisdomResponse } from "./response";

export interface IDomainAgent {
  execute(
    semantic: SemanticContext,
    context: AIContext
  ): Promise<WisdomResponse>;
}
