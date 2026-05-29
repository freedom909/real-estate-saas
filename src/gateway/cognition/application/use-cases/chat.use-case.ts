import { injectable } from "tsyringe";

import { UserContext } from "../../../../infrastructure/auth/auth-context";
import { SemanticExtractor } from "../../domain/semantic/extractors/semantic.extractor";
import { Planner } from "../../domain/planning/planners/planner";
import { SequentialRuntime } from "../../domain/runtime/executors/sequential.runtime";
import { ChatInput } from "./chat.input";
import { TaskStatus } from "../../domain/planning/types/enums";
import { ChatResponse } from "../../domain/types/enums/chat.response";


@injectable()
export class ChatUseCase {
  constructor(
    private extractor: SemanticExtractor,
    private planner: Planner,
    private runtime: SequentialRuntime
  ) {}

  async execute(input: ChatInput, user: UserContext): Promise<ChatResponse> {
    const { message } = input;

    // Phase 1: Semantics
    const context = await this.extractor.extract(message);

    // Phase 2: Planning
    const plan = await this.planner.plan(context);

    // Phase 3: Runtime Execution
    await this.runtime.execute(plan);

    return {
      success: !plan.tasks.some(t => t.status === TaskStatus.FAILED),
      planId: plan.id,
      summary: plan.tasks.map(t => ({ 
        id: t.id, 
        capability: t.capability.toString(),
        status: t.status 
      }))
    };
  }
}