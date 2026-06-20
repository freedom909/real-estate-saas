import { WorkflowStep } from "../planner/workflow.planner";

export class CompensationExecutor {
  async execute(
    failedAction: string,
    steps: WorkflowStep[],
    executedActions: string[]
  ): Promise<void> {
    console.log(`Initiating compensation for failed action: ${failedAction}`);

    // Execute compensation in reverse order of execution
    const reverseOrder = [...executedActions].reverse();

    for (const actionId of reverseOrder) {
      const step = steps.find(s => s.action === actionId);
      if (step?.compensation && step.compensation.length > 0) {
        for (const compensationAction of step.compensation) {
          console.log(`Executing compensation action: ${compensationAction}`);
          // TODO: Actually execute compensation capability
        }
      }
    }
  }
}
