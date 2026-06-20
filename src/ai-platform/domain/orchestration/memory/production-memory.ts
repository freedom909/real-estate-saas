
import { WorldState } from "../state/world-state";
import { Lesson } from "../learning/reflection-engine";

export interface WMElement {
  entity: string;
  field: string;
  value: any;
  operator?: string;
}

export interface ProductionOperator {
  name: string;
  parameters: Record<string, any>;
}

export interface ProductionRule {
  id: string;
  name: string;
  conditions: WMElement[];
  actions: ProductionOperator[];
  utility: number;
  usageCount: number;
  successCount: number;
  createdAt: number;
  lastUsed: number;
  sourceLesson?: string;
}

export class ProductionMemory {
  private rules: Map<string, ProductionRule> = new Map();
  private explorationRate: number = 0.1;

  createRule(
    name: string,
    conditions: WMElement[],
    actions: ProductionOperator[],
    sourceLesson?: string
  ): ProductionRule {
    const rule: ProductionRule = {
      id: `production:${name}:${Date.now()}`,
      name,
      conditions,
      actions,
      utility: 0.5,
      usageCount: 0,
      successCount: 0,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      sourceLesson
    };

    this.rules.set(rule.id, rule);
    return rule;
  }

  findMatchingRules(state: WorldState): ProductionRule[] {
    const matching: Array<{ rule: ProductionRule; matchScore: number }> = [];

    for (const rule of this.rules.values()) {
      let matchScore = 0;
      let matches = true;

      for (const condition of rule.conditions) {
        const entityState = state[condition.entity];
        if (!entityState) {
          matches = false;
          break;
        }

        const actualValue = entityState[condition.field];
        if (condition.operator === "eq" || !condition.operator) {
          if (actualValue === condition.value) {
            matchScore += 1;
          } else {
            matches = false;
            break;
          }
        }
      }

      if (matches) {
        matching.push({ rule, matchScore });
      }
    }

    return matching
      .sort((a, b) => {
        const scoreA = a.rule.utility * 0.7 + a.matchScore * 0.3;
        const scoreB = b.rule.utility * 0.7 + b.matchScore * 0.3;
        return scoreB - scoreA;
      })
      .map(m => m.rule);
  }

  selectRule(matchingRules: ProductionRule[]): ProductionRule | null {
    if (matchingRules.length === 0) return null;

    if (Math.random() < this.explorationRate && matchingRules.length > 1) {
      return matchingRules[Math.floor(Math.random() * matchingRules.length)];
    }

    return matchingRules[0];
  }

  recordRuleUsage(rule: ProductionRule, success: boolean): void {
    rule.usageCount++;
    rule.lastUsed = Date.now();
    if (success) {
      rule.successCount++;
    }

    const alpha = 0.1;
    const outcome = success ? 1.0 : 0.0;
    rule.utility = rule.utility * (1 - alpha) + outcome * alpha;
  }

  createRuleFromLesson(lesson: Lesson): ProductionRule | null {
    if (lesson.type === "success") {
      return this.createRule(
        `learned:${Date.now()}`,
        [{ entity: "system", field: "state", value: "ready", operator: "eq" }],
        [{ name: "default_action", parameters: {} }],
        lesson.id
      );
    }
    return null;
  }

  getProductionSummary(): {
    totalRules: number;
    topRules: Array<{ name: string; utility: number; usageCount: number }>;
    averageUtility: number;
  } {
    const rules = Array.from(this.rules.values());
    if (rules.length === 0) {
      return { totalRules: 0, topRules: [], averageUtility: 0 };
    }

    const topRules = rules
      .sort((a, b) => b.utility - a.utility)
      .slice(0, 5)
      .map(r => ({
        name: r.name,
        utility: r.utility,
        usageCount: r.usageCount
      }));

    const averageUtility = rules.reduce((sum, r) => sum + r.utility, 0) / rules.length;

    return {
      totalRules: rules.length,
      topRules,
      averageUtility
    };
  }
}
