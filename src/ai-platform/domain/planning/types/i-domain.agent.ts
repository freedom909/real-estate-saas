// src/ai-platform/cognition/domain/agents/types/i-domain.agent.ts

import { Task } from "../planners/task";


export interface IDomainAgent {
  execute(task: Task): Promise<any>;

}