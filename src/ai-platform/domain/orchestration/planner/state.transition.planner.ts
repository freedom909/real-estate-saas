import { ParsedGoal } from "./goal.parser";
import { CapabilityRegistryEntry } from "../registry/capability-registry.types";
import { CapabilityRegistry } from "../registry";
import { WorldState, Operator } from "../state/world-state";

export interface PlanResult {
  actions: string[];
  graph: Map<string, Set<string>>;
  steps: CapabilityRegistryEntry[];
}

export class StateTransitionPlanner {
  plan(
    goal: ParsedGoal,
    currentState: WorldState = {}
  ): PlanResult {
    console.log("🤖 StateTransitionPlanner: Starting planning...");
    console.log("📊 Current State:", JSON.stringify(currentState, null, 2));
    console.log("🎯 Goal State:", JSON.stringify(goal.goalStates, null, 2));

    if (this.isGoalAlreadyAchieved(goal.goalStates, currentState)) {
      console.log("✅ Goal already achieved!");
      return { actions: [], graph: new Map(), steps: [] };
    }

    const relevantCapabilities = this.findRelevantCapabilities(goal.goalStates);
    console.log("🔍 Found relevant capabilities:", relevantCapabilities.map(c => c.id));

    const { actions, graph } = this.buildPlan(relevantCapabilities, goal.goalStates, currentState);

    const steps = actions.map(id => CapabilityRegistry[id]);
    console.log("📋 Final plan execution order:", actions);

    return { actions, graph, steps };
  }

  private isGoalAlreadyAchieved(
    goalStates: any[], currentState: WorldState): boolean {
    return goalStates.every(goalState => {
      const entity = currentState[goalState.entity];
      if (!entity) return false;
      return entity[goalState.field] === goalState.value;
    });
  }

  private findRelevantCapabilities(goalStates: any[]): CapabilityRegistryEntry[] {
    const relevant: CapabilityRegistryEntry[] = [];

    Object.values(CapabilityRegistry).forEach(capability => {
      const isRelevant = capability.effects.some(effect => {
        return goalStates.some(goalState => {
          return effect.entity === goalState.entity &&
            effect.field === goalState.field &&
            effect.value === goalState.value;
        });
      });
      if (isRelevant) {
        relevant.push(capability);
      }
    });

    return relevant;
  }

  private buildPlan(
    relevantCapabilities: CapabilityRegistryEntry[],
    goalStates: any[],
    currentState: WorldState
  ): { actions: string[], graph: Map<string, Set<string>> } {
    const graph = new Map<string, Set<string>>();
    const dependencies = new Map<string, Set<string>>();

    relevantCapabilities.forEach(capability => {
      if (!graph.has(capability.id)) {
        graph.set(capability.id, new Set());
        dependencies.set(capability.id, new Set());
      }

      relevantCapabilities.forEach(otherCapability => {
        if (otherCapability.id === capability.id) return;

        capability.preconditions.some(precondition => {
          otherCapability.effects.some(effect => {
            if (precondition.entity === effect.entity &&
                precondition.field === effect.field &&
                precondition.operator === Operator.EQ &&
                effect.value === precondition.value) {
              dependencies.get(capability.id)?.add(otherCapability.id);
              return true;
            }
            return false;
          });
        });
      });
    });

    const visited = new Set<string>();
    const result: string[] = [];

    const topologicalSort = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      (dependencies.get(nodeId)?.forEach(depId => {
        topologicalSort(depId);
      });
      result.push(nodeId);
    };

    relevantCapabilities.forEach(capability => {
      topologicalSort(capability.id);
    });

    return { actions: result, graph };
  }
}
