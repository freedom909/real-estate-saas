
/**
 * Rule Learner - 真实规则学习
 *
 * 丢弃 ID/UUID，保留业务属性！
 * 不会生成：IF booking.id = BKG-1000 THEN...
 * 会生成：IF booking.status = confirmed AND payment.status = paid THEN...
 */

import { EpisodeRecord } from "../memory/episodic/episode-record";

export interface Condition {
  entity: string;
  field: string;
  value: any;
  operator: "eq" | "gt" | "lt";
}

export interface ProductionRule {
  id: string;
  name: string;
  conditions: Condition[];
  actionName: string;
  utility: number; // 成功率
  usageCount: number;
  successCount: number;
  createdAt: number;
  lastUsed: number;
}

export class RuleLearner {
  private rules: Map<string, ProductionRule> = new Map();

  /**
   * 从 Episode 学习规则
   */
  learnFromEpisode(episode: EpisodeRecord): ProductionRule | null {
    if (!episode.outcome.success) {
      return null; // 只从成功经验学习
    }

    // 提取有意义的条件（丢弃 ID/UUID/时间戳）
    const conditions = this.extractMeaningfulConditions(episode);

    if (conditions.length === 0) {
      return null;
    }

    const existing = this.findMatchingRule(conditions, episode.action.name);
    if (existing) {
      // 强化现有规则
      existing.usageCount++;
      existing.successCount++;
      existing.utility = existing.successCount / existing.usageCount;
      existing.lastUsed = Date.now();
      return existing;
    }

    // 创建新规则
    const rule: ProductionRule = {
      id: `rule:${Date.now()}:${Math.random().toString(36).substr(2, 6)}`,
      name: this.generateRuleName(conditions, episode.action.name),
      conditions,
      actionName: episode.action.name,
      utility: 1.0,
      usageCount: 1,
      successCount: 1,
      createdAt: Date.now(),
      lastUsed: Date.now()
    };

    this.rules.set(rule.id, rule);
    console.log(`📦 [RuleLearner] Learned new rule: ${rule.name}`);

    return rule;
  }

  private extractMeaningfulConditions(episode: EpisodeRecord): Condition[] {
    const conditions: Condition[] = [];
    const ctx = episode.startContext;

    // 提取 Booking 属性（排除 ID）
    if (ctx.booking) {
      if (ctx.booking.status) {
        conditions.push({
          entity: "booking",
          field: "status",
          value: ctx.booking.status,
          operator: "eq"
        });
      }
      if (ctx.booking.channel) {
        conditions.push({
          entity: "booking",
          field: "channel",
          value: ctx.booking.channel,
          operator: "eq"
        });
      }
    }

    // 提取 Payment 属性（排除 ID）
    if (ctx.payment) {
      if (ctx.payment.status) {
        conditions.push({
          entity: "payment",
          field: "status",
          value: ctx.payment.status,
          operator: "eq"
        });
      }
      if (ctx.payment.method) {
        conditions.push({
          entity: "payment",
          field: "method",
          value: ctx.payment.method,
          operator: "eq"
        });
      }
    }

    return conditions;
  }

  private findMatchingRule(
    conditions: Condition[],
    actionName: string
  ): ProductionRule | null {
    for (const rule of this.rules.values()) {
      if (rule.actionName !== actionName) continue;

      if (this.conditionsMatch(rule.conditions, conditions)) {
        return rule;
      }
    }
    return null;
  }

  private conditionsMatch(a: Condition[], b: Condition[]): boolean {
    if (a.length !== b.length) return false;

    for (const condA of a) {
      const match = b.find(c =>
        c.entity === condA.entity &&
        c.field === condA.field &&
        c.value === condA.value
      );
      if (!match) return false;
    }

    return true;
  }

  private generateRuleName(conditions: Condition[], actionName: string): string {
    const condStr = conditions
      .map(c => `${c.entity}.${c.field}=${c.value}`)
      .join(" AND ");

    return `IF ${condStr} THEN ${actionName}`;
  }

  /**
   * 找到匹配当前状态的规则
   */
  findMatchingRules(context: any): ProductionRule[] {
    const matching: ProductionRule[] = [];

    for (const rule of this.rules.values()) {
      let allMatch = true;
      for (const cond of rule.conditions) {
        const entityState = context[cond.entity];
        if (!entityState) {
          allMatch = false;
          break;
        }
        if (entityState[cond.field] !== cond.value) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) {
        matching.push(rule);
      }
    }

    return matching.sort((a, b) => b.utility - a.utility);
  }

  recordRuleUsage(ruleId: string, success: boolean): void {
    const rule = this.rules.get(ruleId);
    if (!rule) return;

    rule.usageCount++;
    if (success) rule.successCount++;
    rule.utility = rule.successCount / rule.usageCount;
    rule.lastUsed = Date.now();
  }

  getRules(): ProductionRule[] {
    return Array.from(this.rules.values()).sort((a, b) => b.utility - a.utility);
  }

  getStats(): {
    totalRules: number;
    topRules: { name: string; utility: number; usageCount: number }[];
  } {
    const topRules = this.getRules()
      .slice(0, 5)
      .map(r => ({
        name: r.name,
        utility: r.utility,
        usageCount: r.usageCount
      }));

    return {
      totalRules: this.rules.size,
      topRules
    };
  }
}
