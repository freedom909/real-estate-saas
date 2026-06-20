import { ParseResult } from "./goal.parser";
import { CapabilityRegistryEntry } from "../registry/capability-registry.types";
import { CapabilityRegistry } from "../registry";
import { WorldState, Precondition, Effect, GoalState, Operator } from "../state/world-state";
import { StateStore } from "../state/state.store";

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

export class GoalRegressionPlanner {
  private stateStore: StateStore;
  private maxDepth: number = 10;

  constructor(initialState: WorldState = {}) {
    this.stateStore = new StateStore(initialState);
  }

  plan(goal: ParseResult, currentState: WorldState): PlanResult {
    console.log("🤖 Goal Regression Planner starting...");
    console.log("🎯 Goal:", goal.goalStates);
    console.log("🏠 Current State:", JSON.stringify(currentState, null, 2));

    const allGoalStates = [...goal.goalStates];
    const planSteps = new Map<string, PlanStep>();
    const graph = new Map<string, Set<string>>();

    let currentDepth = 0;
    let remainingGoals = [...allGoalStates];

    while (remainingGoals.length > 0 && currentDepth < this.maxDepth) {
      currentDepth++;
      console.log(`\n🔍 Planning depth ${currentDepth}, remaining goals:`, remainingGoals);

      const newRemainingGoals: GoalState[] = [];

      for (const goalState of remainingGoals) {
        if (this.isGoalSatisfied(goalState, currentState)) {
          console.log(`✅ Goal already satisfied: ${goalState.entity}.${goalState.field} = ${goalState.value}`);
          continue;
        }

        const capableCapabilities = this.findCapabilitiesThatProduce(goalState);
        
        if (capableCapabilities.length === 0) {
          console.warn(`⚠️ No capability found to achieve: ${goalState.entity}.${goalState.field} = ${goalState.value}`);
          continue;
        }

        const selectedCapability = this.selectBestCapability(capableCapabilities);
        console.log(`🔧 Selected capability: ${selectedCapability.id}`);

        if (!planSteps.has(selectedCapability.id)) {
          planSteps.set(selectedCapability.id, {
            capabilityId: selectedCapability.id,
            capability: selectedCapability,
            dependsOn: []
          });
          graph.set(selectedCapability.id, new Set());
        }

        for (const precondition of selectedCapability.preconditions) {
          if (!this.isPreconditionSatisfied(precondition, currentState)) {
            const preconditionGoal = this.preconditionToGoal(precondition);
            if (preconditionGoal) {
              console.log(`📋 Precondition needed: ${precondition.entity}.${precondition.field} ${precondition.operator} ${precondition.value}`);
              newRemainingGoals.push(preconditionGoal);

              const preconditionCapabilities = this.findCapabilitiesThatProduce(preconditionGoal);
              for (const preconditionCapability of preconditionCapabilities) {
                if (!planSteps.has(preconditionCapability.id)) {
                  planSteps.set(preconditionCapability.id, {
                    capabilityId: preconditionCapability.id,
                    capability: preconditionCapability,
                    dependsOn: []
                  });
                  graph.set(preconditionCapability.id, new Set());
                }

                const currentStep = planSteps.get(selectedCapability.id)!;
                if (!currentStep.dependsOn.includes(preconditionCapability.id)) {
                  currentStep.dependsOn.push(preconditionCapability.id);
                }
                graph.get(selectedCapability.id)?.add(preconditionCapability.id);
              }
            }
          }
        }
      }

      remainingGoals = newRemainingGoals;
    }

    const executionOrder = this.topologicalSort(Array.from(planSteps.values()), graph);

    console.log("\n📊 Plan complete!");
    console.log("Execution order:", executionOrder);

    return {
      steps: executionOrder.map(id => planSteps.get(id)!),
      executionOrder,
      graph,
      goal
    };
  }

  private isGoalSatisfied(goal: GoalState, state: WorldState): boolean {
    const currentValue = state[goal.entity]?.[goal.field];
    return currentValue === goal.value;
  }

  private isPreconditionSatisfied(precondition: Precondition, state: WorldState): boolean {
    const currentValue = state[precondition.entity]?.[precondition.field];

    switch (precondition.operator) {
      case Operator.EQ:
        return currentValue === precondition.value;
      case Operator.NEQ:
        return currentValue !== precondition.value;
      case Operator.GT:
        return currentValue > precondition.value;
      case Operator.GTE:
        return currentValue >= precondition.value;
      case Operator.LT:
        return currentValue < precondition.value;
      case Operator.LTE:
        return currentValue <= precondition.value;
      case Operator.EXISTS:
        return currentValue !== undefined;
      case Operator.NOT_EXISTS:
        return currentValue === undefined;
      case Operator.IN:
        return Array.isArray(precondition.value) && precondition.value.includes(currentValue);
      case Operator.NOT_IN:
        return Array.isArray(precondition.value) && !precondition.value.includes(currentValue);
      default:
        return false;
    }
  }

  private findCapabilitiesThatProduce(goal: GoalState): CapabilityRegistryEntry[] {
    return Object.values(CapabilityRegistry).filter(capability => {
      return capability.effects.some(effect => {
        return effect.entity === goal.entity &&
               effect.field === goal.field &&
               effect.value === goal.value;
      });
    });
  }

  private selectBestCapability(capabilities: CapabilityRegistryEntry[]): CapabilityRegistryEntry {
    if (capabilities.length === 0) {
      throw new Error("No capabilities to select from");
    }

    return capabilities.sort((a, b) => {
      const riskScore = (a.riskLevel?.charCodeAt(0) || 0) - (b.riskLevel?.charCodeAt(0) || 0);
      if (riskScore !== 0) return riskScore;

      const costScore = (a.cost || 0) - (b.cost || 0);
      if (costScore !== 0) return costScore;

      return a.preconditions.length - b.preconditions.length;
    })[0];
  }

  private preconditionToGoal(precondition: Precondition): GoalState | null {
    if (precondition.operator === Operator.EQ && precondition.value !== undefined) {
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
