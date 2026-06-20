import { WorldState, GoalState } from "../state/world-state";
import { ParseResult } from "../planner/goal.parser";
import { MemoryStore } from "../memory/memory-store";

export interface ReasoningContext {
  currentState: WorldState;
  goalState?: ParseResult;
  observations: any[];
  history: any[];
  plan?: any;
  currentStep?: any;
}

export interface ReasoningDecision {
  shouldContinue: boolean;
  shouldReplan: boolean;
  updatedGoals?: GoalState[];
  reasoning: string;
  confidence: number;
  suggestedAction?: string;
  failureAnalysis?: {
    rootCause?: string;
    possibleFixes?: string[];
  };
}

export class Reasoner {
  private memory: MemoryStore;

  constructor(memory?: MemoryStore) {
    this.memory = memory || new MemoryStore();
  }

  async reason(
    context: ReasoningContext
  ): Promise<ReasoningDecision> {
    console.log("🧠 Reasoning...");
    console.log("📊 Current State:", context.currentState);
    console.log("🎯 Goal:", context.goalState?.goalStates);

    if (!context.goalState) {
      return {
        shouldContinue: false,
        shouldReplan: false,
        reasoning: "No goal specified",
        confidence: 1.0
      };
    }

    const allGoalsSatisfied = this.areAllGoalsSatisfied(context.goalState.goalStates, context.currentState);
    if (allGoalsSatisfied) {
      console.log("✅ All goals satisfied!");
      this.memory.addEpisodicMemory(
        "All goals achieved",
        "success",
        1.0,
        { goals: context.goalState.goalStates, finalState: context.currentState }
      );
      return {
        shouldContinue: false,
        shouldReplan: false,
        reasoning: "All goals satisfied!",
        confidence: 1.0
      };
    }

    if (context.observations.length > 0) {
      const lastObservation = context.observations[context.observations.length - 1];
      const failureAnalysis = this.analyzeFailure(lastObservation, context.currentState);

      if (failureAnalysis) {
        this.memory.addEpisodicMemory(
          `Failure in ${context.currentStep?.capabilityId || "unknown step"}`,
          "failure",
          0.9,
          { ...failureAnalysis, observation: lastObservation }
        );

        const serviceHealth = this.memory.getServiceHealth(
          context.currentStep?.capabilityId?.split(".")[0] || "unknown"
        );

        if (serviceHealth.recentFailures >= 3) {
          return {
            shouldContinue: true,
            shouldReplan: true,
            reasoning: `Service instability detected (${serviceHealth.recentFailures} recent failures). Reliability: ${(serviceHealth.reliability * 100).toFixed(1)}%`,
            confidence: 0.9,
            failureAnalysis
          };
        }

        return {
          shouldContinue: true,
          shouldReplan: true,
          reasoning: `Failure detected: ${failureAnalysis.rootCause || "Unknown issue"}`,
          confidence: 0.8,
          failureAnalysis
        };
      }
    }

    return {
      shouldContinue: true,
      shouldReplan: false,
      reasoning: "Continue executing current plan",
      confidence: 0.7
    };
  }

  private areAllGoalsSatisfied(goals: GoalState[], state: WorldState): boolean {
    return goals.every(goal => {
      const currentValue = state[goal.entity]?.[goal.field];
      return currentValue === goal.value;
    });
  }

  private analyzeFailure(observation: any, state: WorldState): {
    rootCause?: string;
    possibleFixes?: string[];
  } | null {
    if (!observation || observation.success) {
      return null;
    }

    const rootCauses: string[] = [];
    const fixes: string[] = [];

    if (observation.error?.message?.includes("payment")) {
      rootCauses.push("Payment service issue");
      if (state.payment?.status === "locked") {
        rootCauses.push("Payment account locked");
        fixes.push("Unlock payment account first");
      }
      fixes.push("Check payment service status");
      fixes.push("Retry with fallback payment method");
    }

    if (observation.error?.message?.includes("booking")) {
      rootCauses.push("Booking service issue");
      if (state.booking?.status === "pending") {
        rootCauses.push("Booking not confirmed yet");
        fixes.push("Confirm booking first");
      }
    }

    if (observation.error?.message?.includes("timeout")) {
      rootCauses.push("Network timeout");
      fixes.push("Retry with longer timeout");
      fixes.push("Check network connectivity");
    }

    if (rootCauses.length === 0) {
      rootCauses.push("Unknown error");
      fixes.push("Check logs for more details");
      fixes.push("Retry operation");
    }

    return {
      rootCause: rootCauses.join("; "),
      possibleFixes: fixes
    };
  }
}
