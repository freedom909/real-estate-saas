
/**
 * Policy Store - 存储学习到的策略！
 */

import { SemanticRule } from "../reasoning/semantic-rule";

export interface PolicyStats {
  totalRules: number;
  highConfidenceRules: number;
  topRules: SemanticRule[];
}

export class PolicyStore {
  private rules: Map<string, SemanticRule> = new Map();

  /**
   * 添加/更新规则
   */
  addRule(rule: SemanticRule): void {
    const existing = this.rules.get(rule.id);
    if (existing) {
      // 合并：保留置信度更高的
      if (rule.confidence > existing.confidence) {
        this.rules.set(rule.id, rule);
        console.log(`📝 [PolicyStore] Updated rule: ${rule.name}`);
      }
    } else {
      this.rules.set(rule.id, rule);
      console.log(`📝 [PolicyStore] Added new rule: ${rule.name}`);
    }
  }

  /**
   * 批量添加规则
   */
  addRules(rules: SemanticRule[]): void {
    for (const rule of rules) {
      this.addRule(rule);
    }
  }

  /**
   * 找到匹配当前状态的规则
   */
  findMatchingRules(state: any): SemanticRule[] {
    const matching: SemanticRule[] = [];

    for (const rule of this.rules.values()) {
      if (this.matchRule(rule, state)) {
        matching.push(rule);
      }
    }

    // 按置信度排序
    return matching.sort((a, b) => b.confidence - a.confidence);
  }

  private matchRule(rule: SemanticRule, state: any): boolean {
    for (const condition of rule.conditions) {
      const value = this.getNestedValue(state, condition.feature);
      if (!this.matchCondition(value, condition)) {
        return false;
      }
    }
    return true;
  }

  private matchCondition(value: any, condition: RuleCondition): boolean {
    switch (condition.operator) {
      case "eq":
        return value === condition.value;
      case "gt":
        return value > condition.value;
      case "lt":
        return value < condition.value;
      case "gte":
        return value >= condition.value;
      case "lte":
        return value <= condition.value;
      case "in":
        return Array.isArray(condition.value) && condition.value.includes(value);
      default:
        return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    const parts = path.split(".");
    let current = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }
    return current;
  }

  /**
   * 更新规则使用记录
   */
  recordRuleUsed(ruleId: string, success: boolean): void {
    const rule = this.rules.get(ruleId);
    if (!rule) return;

    rule.lastUsedAt = Date.now();

    // 轻微调整置信度
    if (success) {
      rule.confidence = Math.min(1, rule.confidence * 1.02);
    } else {
      rule.confidence = Math.max(0, rule.confidence * 0.95);
    }
  }

  /**
   * 获取统计
   */
  getStats(): PolicyStats {
    const rules = Array.from(this.rules.values());
    const highConfidenceRules = rules.filter(r => r.confidence > 0.8);
    const topRules = rules
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);

    return {
      totalRules: rules.length,
      highConfidenceRules: highConfidenceRules.length,
      topRules
    };
  }

  getAllRules(): SemanticRule[] {
    return Array.from(this.rules.values());
  }
}
