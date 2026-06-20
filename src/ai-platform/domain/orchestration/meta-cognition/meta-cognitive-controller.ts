
import { ProductionRule } from "../memory/production-memory";
import { WorldState, GoalState } from "../state/world-state";

export enum ExecutionMode {
  PRODUCTION = "production",
  PLANNER = "planner",
  REASONER = "reasoner",
  SKILL = "skill",
  ASK_HUMAN = "ask_human"
}

export interface MetaDecision {
  mode: ExecutionMode;
  confidence: number;
  reasoning: string;
  timestamp: number;
}

export class MetaCognitiveController {
  private decisionHistory: MetaDecision[] = [];
  private modePerformance: Map<ExecutionMode, { success: number; total: number }> = new Map();

  constructor() {
    for (const mode of Object.values(ExecutionMode)) {
      this.modePerformance.set(mode, { success: 0, total: 0 });
    }
  }

  decideMode(
    goal: GoalState,
    state: WorldState,
    availableRules: ProductionRule[],
    availableSkills: any[],
    urgency: number = 0.5
  ): MetaDecision {
    const decision = this.makeDecision(goal, state, availableRules, availableSkills, urgency);
    this.decisionHistory.push(decision);
    return decision;
  }

  private makeDecision(
    goal: GoalState,
    state: WorldState,
    availableRules: ProductionRule[],
    availableSkills: any[],
    urgency: number
  ): MetaDecision {
    const timestamp = Date.now();

    const goodRule = availableRules.find(r => r.utility > 0.7);
    if (goodRule && urgency > 0.5) {
      return {
        mode: ExecutionMode.PRODUCTION,
        confidence: goodRule.utility,
        reasoning: `Found high-utility production rule (${goodRule.name})`,
        timestamp
      };
    }

    const goodSkill = availableSkills.find(s => s.successRate > 0.8);
    if (goodSkill) {
      return {
        mode: ExecutionMode.SKILL,
        confidence: goodSkill.successRate,
        reasoning: `Found high-performance skill (${goodSkill.name})`,
        timestamp
      };
    }

    if (availableRules.length > 0 && availableRules[0].utility > 0.5) {
      return {
        mode: ExecutionMode.PRODUCTION,
        confidence: availableRules[0].utility,
        reasoning: `Using best available production rule`,
        timestamp
      };
    }

    return {
      mode: ExecutionMode.PLANNER,
      confidence: 0.6,
      reasoning: `No strong rules/skills, using planner`,
      timestamp
    };
  }

  recordModePerformance(mode: ExecutionMode, success: boolean): void {
    const stats = this.modePerformance.get(mode)!;
    stats.total++;
    if (success) {
      stats.success++;
    }
  }

  getModePerformance(mode: ExecutionMode): { successRate: number; total: number } {
    const stats = this.modePerformance.get(mode)!;
    return {
      successRate: stats.total > 0 ? stats.success / stats.total : 0,
      total: stats.total
    };
  }

  getMetaSummary(): {
    totalDecisions: number;
    byMode: Record<ExecutionMode, number>;
    performance: Record<ExecutionMode, { successRate: number; total: number }>;
  } {
    const byMode: Record<string, number> = {};
    for (const decision of this.decisionHistory) {
      byMode[decision.mode] = (byMode[decision.mode] || 0) + 1;
    }

    const performance: Record<string, any> = {};
    for (const mode of Object.values(ExecutionMode)) {
      performance[mode] = this.getModePerformance(mode);
    }

    return {
      totalDecisions: this.decisionHistory.length,
      byMode: byMode as any,
      performance
    };
  }
}
