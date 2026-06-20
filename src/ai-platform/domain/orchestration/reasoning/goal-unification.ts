import { WorldState, GoalState, Precondition, Effect, Operator } from "../state/world-state";
import { CapabilityRegistryEntry } from "../registry/capability-registry.types";

export interface UnificationResult {
  matches: boolean;
  score: number;
  bindings?: Record<string, any>;
}

export class GoalUnificationEngine {
  canAchieveGoal(goal: GoalState, effect: Effect): UnificationResult {
    if (goal.entity !== effect.entity) {
      return { matches: false, score: 0 };
    }

    if (goal.field !== effect.field) {
      return { matches: false, score: 0 };
    }

    const exactMatch = goal.value === effect.value;
    if (exactMatch) {
      return { matches: true, score: 1.0 };
    }

    const softMatch = this.checkSoftMatch(goal, effect);
    if (softMatch.matches) {
      return softMatch;
    }

    return { matches: false, score: 0 };
  }

  private checkSoftMatch(goal: GoalState, effect: Effect): UnificationResult {
    if (typeof goal.value === "boolean" && typeof effect.value === "boolean") {
      return { matches: goal.value === effect.value, score: 0.95 };
    }

    if (typeof goal.value === "number" && typeof effect.value === "number") {
      const tolerance = 0.1;
      const relativeDiff = Math.abs(goal.value - effect.value) / (Math.abs(goal.value) + 1);
      if (relativeDiff < tolerance) {
        return { matches: true, score: 1 - relativeDiff };
      }
    }

    if (typeof goal.value === "string" && typeof effect.value === "string") {
      const lowerGoal = goal.value.toLowerCase();
      const lowerEffect = effect.value.toLowerCase();
      
      if (lowerGoal.includes(lowerEffect) || lowerEffect.includes(lowerGoal)) {
        return { matches: true, score: 0.85 };
      }
    }

    return { matches: false, score: 0 };
  }

  checkPrecondition(
    precondition: Precondition,
    state: WorldState
  ): UnificationResult {
    const currentValue = state[precondition.entity]?.[precondition.field];
    
    switch (precondition.operator) {
      case Operator.EQ:
        const eqMatch = currentValue === precondition.value;
        return { matches: eqMatch, score: eqMatch ? 1.0 : 0 };

      case Operator.NEQ:
        const neqMatch = currentValue !== precondition.value;
        return { matches: neqMatch, score: neqMatch ? 1.0 : 0 };

      case Operator.IN:
        if (Array.isArray(precondition.value)) {
          const inMatch = precondition.value.includes(currentValue);
          return { matches: inMatch, score: inMatch ? 1.0 : 0 };
        }
        return { matches: false, score: 0 };

      case Operator.NOT_IN:
        if (Array.isArray(precondition.value)) {
          const notInMatch = !precondition.value.includes(currentValue);
          return { matches: notInMatch, score: notInMatch ? 1.0 : 0 };
        }
        return { matches: false, score: 0 };

      case Operator.EXISTS:
        const existsMatch = currentValue !== undefined && currentValue !== null;
        return { matches: existsMatch, score: existsMatch ? 1.0 : 0 };

      case Operator.NOT_EXISTS:
        const notExistsMatch = currentValue === undefined || currentValue === null;
        return { matches: notExistsMatch, score: notExistsMatch ? 1.0 : 0 };

      case Operator.GT:
        const gtMatch = typeof currentValue === "number" && 
                       typeof precondition.value === "number" && 
                       currentValue > precondition.value;
        return { matches: gtMatch, score: gtMatch ? 1.0 : 0 };

      case Operator.GTE:
        const gteMatch = typeof currentValue === "number" && 
                        typeof precondition.value === "number" && 
                        currentValue >= precondition.value;
        return { matches: gteMatch, score: gteMatch ? 1.0 : 0 };

      case Operator.LT:
        const ltMatch = typeof currentValue === "number" && 
                       typeof precondition.value === "number" && 
                       currentValue < precondition.value;
        return { matches: ltMatch, score: ltMatch ? 1.0 : 0 };

      case Operator.LTE:
        const lteMatch = typeof currentValue === "number" && 
                        typeof precondition.value === "number" && 
                        currentValue <= precondition.value;
        return { matches: lteMatch, score: lteMatch ? 1.0 : 0 };

      default:
        return { matches: false, score: 0 };
    }
  }

  findBestCapabilitiesForGoal(
    goal: GoalState,
    capabilities: CapabilityRegistryEntry[]
  ): Array<{ capability: CapabilityRegistryEntry; score: number }> {
    const candidates: Array<{ capability: CapabilityRegistryEntry; score: number }> = [];

    for (const capability of capabilities) {
      for (const effect of capability.effects) {
        const unification = this.canAchieveGoal(goal, effect);
        if (unification.matches) {
          candidates.push({
            capability,
            score: unification.score
          });
          break;
        }
      }
    }

    return candidates.sort((a, b) => b.score - a.score);
  }
}
