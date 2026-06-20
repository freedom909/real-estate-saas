import { ParseResult } from "./goal.parser";
import { CapabilityRegistryEntry } from "../registry/capability-registry.types";
import { CapabilityRegistry } from "../registry";
import { WorldState, GoalState, Precondition } from "../state/world-state";
import { WorldStateObserver } from "../state/world-state-observer";
import { GoalUnificationEngine } from "../reasoning/goal-unification";

export interface PlanStep {
  capabilityId: string;
  capability: CapabilityRegistryEntry;
  dependsOn: string[];
}

export interface PlanResult {
  steps: PlanStep[];
  executionOrder: string[];
  graph: Map<string, Set<string>>;
  goal: ParseResult;
}

export class GoalRegressionPlannerV2 {
  private observer: WorldStateObserver;
  private unificationEngine: GoalUnificationEngine;
  private maxDepth: number = 10;
  private maxIterations: number = 100;

  constructor(worldStateObserver: WorldStateObserver) {
    this.observer = worldStateObserver;
    this.unificationEngine = new GoalUnificationEngine();
  }

  async plan(goal: ParseResult): Promise<PlanResult> {
    console.log("🚀 Goal Regression Planner V2 (Unification-based)");
    console.log("🎯 Goal States:", goal.goalStates);
    
    const currentState = await this.observer.getState();
    console.log("🌍 Current World State:", JSON.stringify(currentState, null, 2));

    const remainingGoals = [...goal.goalStates];
    const planSteps: PlanStep[] = [];
    const dependencyGraph = new Map<string, Set<string>>();
    const plannedActions = new Set<string>();

    let iterations = 0;
    while (remainingGoals.length > 0 && iterations < this.maxIterations) {
      iterations++;
      console.log(`\n🔄 Iteration ${iterations}, remaining goals:`, remainingGoals);

      const goal = remainingGoals.shift()!;
      
      const currentStateCheck = await this.observer.getState();
      if (this.isGoalSatisfied(goal, currentStateCheck)) {
        console.log(`✅ Goal already satisfied: ${goal.entity}.${goal.field} = ${goal.value}`);
        continue;
      }

      const candidates = this.unificationEngine.findBestCapabilitiesForGoal(
        goal,
        Object.values(CapabilityRegistry)
      );

      if (candidates.length === 0) {
        console.warn(`⚠️ No capability found for goal: ${goal.entity}.${goal.field} = ${goal.value}`);
        continue;
      }

      const bestCandidate = candidates[0];
      console.log(`🏆 Selected capability: ${bestCandidate.capability.id} (score: ${bestCandidate.score})`);

      if (!plannedActions.has(bestCandidate.capability.id)) {
        plannedActions.add(bestCandidate.capability.id);
        const step: PlanStep = {
          capabilityId: bestCandidate.capability.id,
          capability: bestCandidate.capability,
          dependsOn: []
        };
        planSteps.unshift(step);
        dependencyGraph.set(step.capabilityId, new Set());
      }

      for (const precondition of bestCandidate.capability.preconditions) {
        const state = await this.observer.getState();
        if (!this.unificationEngine.checkPrecondition(precondition, state).matches) {
          const subGoal = this.preconditionToGoal(precondition);
          if (subGoal && !remainingGoals.some(g => 
            g.entity === subGoal.entity && 
            g.field === subGoal.field && 
            g.value === subGoal.value
          )) {
            console.log(`📋 Sub-goal needed: ${subGoal.entity}.${subGoal.field} = ${subGoal.value}`);
            remainingGoals.unshift(subGoal);
          }

          const subCapabilities = this.unificationEngine.findBestCapabilitiesForGoal(
            subGoal!,
            Object.values(CapabilityRegistry)
          );

          for (const subCap of subCapabilities) {
            if (!plannedActions.has(subCap.capability.id)) {
              plannedActions.add(subCap.capability.id);
              const subStep: PlanStep = {
                capabilityId: subCap.capability.id,
                capability: subCap.capability,
                dependsOn: []
              };
              planSteps.unshift(subStep);
              dependencyGraph.set(subStep.capabilityId, new Set());
            }

            const step = planSteps.find(s => s.capabilityId === bestCandidate.capability.id)!;
            const subStep = planSteps.find(s => s.capabilityId === subCap.capability.id)!;
            
            if (!step.dependsOn.includes(subStep.capabilityId)) {
              step.dependsOn.push(subStep.capabilityId);
            }
            dependencyGraph.get(bestCandidate.capability.id)?.add(subStep.capabilityId);
          }
        }
      }
    }

    const executionOrder = this.topologicalSort(planSteps, dependencyGraph);
    console.log("\n📊 Final Plan Execution Order:", executionOrder);

    return {
      steps: executionOrder.map(id => planSteps.find(s => s.capabilityId === id)!),
      executionOrder,
      graph: dependencyGraph,
      goal
    };
  }

  private isGoalSatisfied(goal: GoalState, state: WorldState): boolean {
    const currentValue = state[goal.entity]?.[goal.field];
    return currentValue === goal.value;
  }

  private preconditionToGoal(precondition: Precondition): GoalState | null {
    if (precondition.operator === "eq" && precondition.value !== undefined) {
      return {
        entity: precondition.entity,
        field: precondition.field,
        value: precondition.value
      };
    }
    return null;
  }

  private topologicalSort(steps: PlanStep[], graph: Map<string, Set<string>>): string[] {
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const dependencies = graph.get(nodeId) || [];
      dependencies.forEach(dep => visit(dep));
      order.push(nodeId);
    };

    steps.forEach(step => visit(step.capabilityId));
    return order;
  }
}
