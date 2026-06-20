import { Observation } from "../executor/workflow.executor";
import { WorldState } from "../state/world-state";

export interface ReplanDecision {
  shouldReplan: boolean;
  reason: string;
  newPlan?: string[];
  alternativeActions?: string[];
  userConfirmationRequired?: boolean;
}

export class ReplanEngine {
  analyze(
    observation: Observation,
    currentStep: any,
    remainingSteps: any[],
    currentState: WorldState
  ): ReplanDecision {
    if (observation.success) {
      return { shouldReplan: false, reason: "Step executed successfully" };
    }

    const errorMessage = observation.error?.message || "";

    if (errorMessage.includes("completed")) {
      return this.handleBookingAlreadyCompleted();
    }

    if (errorMessage.includes("Network")) {
      return {
        shouldReplan: true,
        reason: "Temporary network error - retrying",
        newPlan: [currentStep.action, ...remainingSteps.map(s => s.action)]
      };
    }

    return {
      shouldReplan: true,
      reason: `Execution failed: ${errorMessage}`,
      userConfirmationRequired: true,
      alternativeActions: []
    };
  }

  private handleBookingAlreadyCompleted(): ReplanDecision {
    return {
      shouldReplan: true,
      reason: "Booking already completed - cannot cancel",
      userConfirmationRequired: true,
      alternativeActions: ["PROCESS_REFUND"]
    };
  }
}
