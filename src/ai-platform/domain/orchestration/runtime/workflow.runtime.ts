import { GoalParser, Intent, ParseResult } from "../planner/goal.parser";
import { GoalRegressionPlanner, PlanResult } from "../planner/goal.regression.planner";
import { WorkflowExecutor, Observation } from "../executor/workflow.executor";
import { ReplanEngine } from "../replan/replan.engine";
import { WorldState } from "../state/world-state";
import { CapabilityRegistryEntry } from "../registry/capability-registry.types";
import { ExecutorRegistry } from "../factory/executor.registry";
import { CapabilityRegistry } from "../registry";

export interface AgentLoopResult {
  success: boolean;
  finalState: WorldState;
  observations: Map<string, Observation>;
  replanCount: number;
  message?: string;
  plan?: PlanResult;
  goal?: ParseResult;
}

export class WorkflowRuntime {
  private goalParser: GoalParser;
  private replanEngine: ReplanEngine;
  private maxReplans: number = 3;
  private executorRegistry: ExecutorRegistry;

  constructor() {
    this.goalParser = new GoalParser();
    this.replanEngine = new ReplanEngine();
    this.executorRegistry = new ExecutorRegistry();
    this.registerDefaultExecutors();
  }

  getGoalParser(): GoalParser {
    return this.goalParser;
  }

  getExecutorRegistry(): ExecutorRegistry {
    return this.executorRegistry;
  }

  async run(
    intent: Intent,
    initialState: WorldState = {}
  ): Promise<AgentLoopResult> {
    console.log("🚀 Agent Loop Starting...");
    console.log("📝 Intent:", intent);

    const goal = await this.goalParser.parse(intent);
    console.log("🎯 Parsed Goal:", goal);

    if (goal.goalStates.length === 0) {
      return {
        success: false,
        finalState: initialState,
        observations: new Map(),
        replanCount: 0,
        message: "No goal states parsed from intent"
      };
    }

    let replanCount = 0;
    let currentState = { ...initialState };
    let allObservations = new Map<string, Observation>();

    while (replanCount <= this.maxReplans) {
      console.log(`\n🔄 Planning iteration ${replanCount + 1}`);

      const planner = new GoalRegressionPlanner(currentState);
      const plan = planner.plan(goal, currentState);

      if (plan.executionOrder.length === 0) {
        console.log("✅ Goal already achieved!");
        return {
          success: true,
          finalState: currentState,
          observations: allObservations,
          replanCount,
          message: "Goal already achieved",
          plan,
          goal
        };
      }

      console.log("📊 Generated Plan Execution Order:", plan.executionOrder);

      const executor = new WorkflowExecutor(currentState);
      executor.getExecutorRegistry();
      
      this.copyExecutors(executor.getExecutorRegistry());

      let loopBroken = false;

      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];
        const remainingSteps = plan.steps.slice(i + 1);

        console.log(`\n▶️ Executing ${i + 1}/${plan.steps.length}: ${step.capabilityId}`);
        const observationResult = await executor.executeStep(step);
        currentState = executor.getStateStore().getState();
        allObservations = new Map([...allObservations, ...executor.getResults()]);

        const replanDecision = this.replanEngine.analyze(
          observationResult.observation,
          {
            action: step.capabilityId,
            dependsOn: step.dependsOn,
            compensation: step.capability.compensation,
            domain: step.capability.domain,
            description: step.capability.description,
            inputs: step.capability.inputs,
            outputs: step.capability.outputs
          },
          remainingSteps.map(s => ({
            action: s.capabilityId,
            dependsOn: s.dependsOn,
            compensation: s.capability.compensation,
            domain: s.capability.domain,
            description: s.capability.description,
            inputs: s.capability.inputs,
            outputs: s.capability.outputs
          })),
          currentState
        );

        if (replanDecision.shouldReplan) {
          console.log("\n🔄 Replan decision made:", replanDecision.reason);

          if (replanDecision.userConfirmationRequired) {
            console.log("⚠️ User confirmation required");
            return {
              success: false,
              finalState: currentState,
              observations: allObservations,
              replanCount,
              message: replanDecision.reason,
              plan,
              goal
            };
          }

          if (step.capability.compensation && step.capability.compensation.length > 0) {
            await executor.executeCompensation(step.capability.compensation);
          }

          replanCount++;
          loopBroken = true;
          break;
        }
      }

      if (!loopBroken) {
        const goalAchieved = this.isGoalAchieved(goal, currentState);
        if (goalAchieved) {
          console.log("\n🎉 Goal Achieved!");
          return {
            success: true,
            finalState: currentState,
            observations: allObservations,
            replanCount,
            message: "Goal achieved successfully",
            plan,
            goal
          };
        }
      }
    }

    console.log("\n⚠️ Max replans reached");
    return {
      success: false,
      finalState: currentState,
      observations: allObservations,
      replanCount,
      message: "Max replans reached",
      goal
    };
  }

  private isGoalAchieved(goal: ParseResult, state: WorldState): boolean {
    return goal.goalStates.every(goalState => {
      const entityState = state[goalState.entity];
      return entityState && entityState[goalState.field] === goalState.value;
    });
  }

  private copyExecutors(targetRegistry: ExecutorRegistry): void {
    for (const executorId of this.executorRegistry.list()) {
    }
  }

  private registerDefaultExecutors(): void {
    class CreateBookingExecutor {
      async execute() {
        return { success: true, bookingId: "booking-123" };
      }
    }

    class CancelBookingExecutor {
      async execute() {
        return { success: true, bookingId: "booking-123" };
      }
    }

    class ConfirmBookingExecutor {
      async execute() {
        return { success: true, bookingId: "booking-123" };
      }
    }

    class CompleteBookingExecutor {
      async execute() {
        return { success: true, bookingId: "booking-123" };
      }
    }

    class ReleaseCalendarExecutor {
      async execute() {
        return { success: true, datesReleased: true };
      }
    }

    class NotifyHostExecutor {
      async execute() {
        return { success: true, sent: true };
      }
    }

    class ProcessPaymentExecutor {
      async execute() {
        return { success: true, paymentId: "payment-123" };
      }
    }

    class ProcessRefundExecutor {
      async execute() {
        return { success: true, refundId: "refund-123" };
      }
    }

    class ReverseRefundExecutor {
      async execute() {
        return { success: true };
      }
    }

    class CreateReviewExecutor {
      async execute() {
        return { success: true, reviewId: "review-123" };
      }
    }

    class RespondToReviewExecutor {
      async execute() {
        return { success: true };
      }
    }

    class AnalyzeReviewExecutor {
      async execute() {
        return { success: true, sentiment: "positive" };
      }
    }

    class CreateListingExecutor {
      async execute() {
        return { success: true, listingId: "listing-123" };
      }
    }

    class ActivateListingExecutor {
      async execute() {
        return { success: true };
      }
    }

    class DeactivateListingExecutor {
      async execute() {
        return { success: true };
      }
    }

    class OptimizeListingExecutor {
      async execute() {
        return { success: true };
      }
    }

    class AnalyzeListingExecutor {
      async execute() {
        return { success: true, score: 95 };
      }
    }

    this.executorRegistry.register("booking.create", CreateBookingExecutor);
    this.executorRegistry.register("booking.cancel", CancelBookingExecutor);
    this.executorRegistry.register("booking.confirm", ConfirmBookingExecutor);
    this.executorRegistry.register("booking.complete", CompleteBookingExecutor);
    this.executorRegistry.register("booking.releaseCalendar", ReleaseCalendarExecutor);
    this.executorRegistry.register("booking.notifyHost", NotifyHostExecutor);
    this.executorRegistry.register("payment.process", ProcessPaymentExecutor);
    this.executorRegistry.register("payment.refund", ProcessRefundExecutor);
    this.executorRegistry.register("payment.reverseRefund", ReverseRefundExecutor);
    this.executorRegistry.register("review.create", CreateReviewExecutor);
    this.executorRegistry.register("review.respond", RespondToReviewExecutor);
    this.executorRegistry.register("review.analyze", AnalyzeReviewExecutor);
    this.executorRegistry.register("listing.create", CreateListingExecutor);
    this.executorRegistry.register("listing.activate", ActivateListingExecutor);
    this.executorRegistry.register("listing.deactivate", DeactivateListingExecutor);
    this.executorRegistry.register("listing.optimize", OptimizeListingExecutor);
    this.executorRegistry.register("listing.analyze", AnalyzeListingExecutor);
  }
}
