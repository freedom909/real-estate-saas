// src/gateway/cognition/domain/runtime/executors/sequential.runtime.ts
import { injectable } from "tsyringe";

import { AgentRouterService } from "../../orchestration/router/agent-router.service";
import { ExecutionPlan } from "../../planning/planners/execution-plan";
import { TaskStatus } from "../../planning/types/enums";

@injectable()
export class SequentialRuntime {
  constructor(
    private agentRouterService: AgentRouterService
  ) {}

  async execute(plan: ExecutionPlan): Promise<void> {
    const tasks = [...plan.tasks]; // Create a mutable copy
    const executedTaskIds = new Set<string>();
    let tasksRemaining = tasks.length;
    let iterationCount = 0;
    const maxIterations = tasks.length * tasks.length; // Max iterations to detect deadlock

    while (tasksRemaining > 0 && iterationCount < maxIterations) {
      let tasksExecutedInThisIteration = 0;

      for (const task of tasks) {
        if (task.status === TaskStatus.PENDING) {
          const allDependenciesMet = task.dependsOn.every(depId =>
            executedTaskIds.has(depId) &&
            plan.tasks.find(t => t.id === depId)?.status === TaskStatus.COMPLETED
          );

          if (allDependenciesMet) {
            task.markRunning();
            tasksExecutedInThisIteration++;
            tasksRemaining--;

            try {
              const agent = this.agentRouterService.route(task.domain);
              const result = await agent.execute(task);
              task.markCompleted(result);
              executedTaskIds.add(task.id);
            } catch (error: any) {
              task.markFailed(error.message || "Unknown error");
              console.error(`Task ${task.id} failed: ${error.message}`);
              // If a task fails, dependent tasks might not be executable.
              // For a sequential runtime, we might stop or mark dependents as failed.
              // For now, let's just mark this one as failed and continue.
              // A more sophisticated runtime might have different error handling strategies.
            }
          }
        }
      }

      if (tasksExecutedInThisIteration === 0 && tasksRemaining > 0) {
        // No tasks were executed in this iteration, but tasks still remain.
        // This indicates a deadlock or an impossible dependency graph.
        const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING);
        const pendingTaskIds = pendingTasks.map(t => t.id);
        const unresolvableDependencies = pendingTasks.filter(t =>
          !t.dependsOn.every(depId => executedTaskIds.has(depId))
        ).map(t => ({ id: t.id, dependsOn: t.dependsOn.filter(depId => !executedTaskIds.has(depId)) }));

        throw new Error(`Execution deadlock detected. Remaining pending tasks: ${pendingTaskIds.join(', ')}. Unresolvable dependencies: ${JSON.stringify(unresolvableDependencies)}`);
      }

      iterationCount++;
    }

    if (tasksRemaining > 0) {
      throw new Error("Execution plan could not be completed within max iterations.");
    }
  }
}