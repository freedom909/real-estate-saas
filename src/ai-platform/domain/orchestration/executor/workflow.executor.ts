import { WorkflowStep } from "../planner/workflow.planner";
import { WorkflowGraph } from "../dependency/workflow.graph";

export class WorkflowExecutor {
  async execute(steps: WorkflowStep[]): Promise<any> {
    const graph = new WorkflowGraph();
    graph.build(steps);
    const order = graph.getExecutionOrder();
    const results: Record<string, any> = {};

    for (const actionId of order) {
      try {
        console.log(`Executing: ${actionId}`);
        results[actionId] = { status: "success" }; // Placeholder for actual capability execution
      } catch (error) {
        console.error(`Error executing ${actionId}:`, error);
        await this.handleCompensation(actionId, steps, results);
        throw error;
      }
    }
    return results;
  }

  private async handleCompensation(
    failedAction: string,
    steps: WorkflowStep[],
    results: Record<string, any>
  ): Promise<void> {
    console.log(`Handling compensation for failure in ${failedAction}`);
    // Execute compensation actions in reverse order of execution
    const step = steps.find(s => s.action === failedAction);
    if (step?.compensation) {
      for (const compensationAction of step.compensation) {
        console.log(`Executing compensation: ${compensationAction}`);
        // Placeholder for compensation execution
      }
    }
  }
}
