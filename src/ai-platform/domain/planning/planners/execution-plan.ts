// src/gateway/cognition/domain/planning/entities/execution-plan.ts
import { Task } from "./task";

export class ExecutionPlan {
  constructor(
    public readonly id: string,
    public readonly tasks: Task[]
  ) {}
}