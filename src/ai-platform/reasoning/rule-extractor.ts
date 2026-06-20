
/**
 * Rule Extractor - 从 Episode 中提取规则！
 *
 * 不再是日志，而是经验沉淀！
 *
 * 例如：
 * Episode 1: airbnb, 48h, coupon, success
 * Episode 2: airbnb, 45h, coupon, success
 * Episode 3: airbnb, 70h, coupon, success
 *
 * → 提取规则：
 * IF channel=airbnb AND hours<72 THEN coupon (95% confidence)
 */

import { EpisodeRecord } from "../memory/episodic/episode-record";
import { SemanticRule, RuleCondition } from "./semantic-rule";

export class RuleExtractor {
  private minSupport: number = 3; // 至少需要3个样本
  private minConfidence: number = 0.6; // 至少60%置信度

  constructor(options?: { minSupport?: number; minConfidence?: number }) {
    if (options?.minSupport) this.minSupport = options.minSupport;
    if (options?.minConfidence) this.minConfidence = options.minConfidence;
  }

  /**
   * 从 Episodes 中提取规则
   */
  extractRules(episodes: EpisodeRecord[]): SemanticRule[] {
    const rules: SemanticRule[] = [];

    // 按动作分组
    const episodesByAction = new Map<string, EpisodeRecord[]>();
    for (const episode of episodes) {
      const action = episode.action.name;
      if (!episodesByAction.has(action)) {
        episodesByAction.set(action, []);
      }
      episodesByAction.get(action)!.push(episode);
    }

    // 为每个动作提取规则
    for (const [action, actionEpisodes] of episodesByAction) {
      const successEpisodes = actionEpisodes.filter(e => e.outcome.success);

      if (successEpisodes.length < this.minSupport) continue;

      // 提取共同条件
      const commonConditions = this.findCommonConditions(successEpisodes);

      if (commonConditions.length > 0) {
        const rule = this.createRule(action, commonConditions, actionEpisodes, successEpisodes);
        if (rule.confidence >= this.minConfidence) {
          rules.push(rule);
          console.log(`📐 [Extractor] Extracted rule: ${rule.name} (confidence=${(rule.confidence * 100).toFixed(0)}%)`);
        }
      }
    }

    return rules;
  }

  /**
   * 找到成功样本的共同条件
   */
  private findCommonConditions(successEpisodes: EpisodeRecord[]): RuleCondition[] {
    const conditions: RuleCondition[] = [];

    // 统计特征分布
    const featureStats = new Map<string, Map<any, number>>();

    for (const episode of successEpisodes) {
      const features = this.extractFeatures(episode.startContext);
      for (const [feature, value] of Object.entries(features)) {
        if (!featureStats.has(feature)) {
          featureStats.set(feature, new Map());
        }
        const counts = featureStats.get(feature)!;
        counts.set(value, (counts.get(value) || 0) + 1);
      }
    }

    // 找出高度相关的特征（90%以上的样本都有相同值）
    for (const [feature, valueCounts] of featureStats) {
      for (const [value, count] of valueCounts) {
        const support = count / successEpisodes.length;
        if (support >= 0.9) {
          conditions.push({
            feature,
            operator: "eq",
            value
          });
        }
      }
    }

    // 处理连续特征（例如 hoursBeforeCheckin）
    const hoursConditions = this.extractHoursCondition(successEpisodes);
    if (hoursConditions) {
      conditions.push(hoursConditions);
    }

    return conditions;
  }

  private extractHoursCondition(episodes: EpisodeRecord[]): RuleCondition | null {
    const hoursValues = episodes
      .map(e => e.startContext.booking?.hoursBeforeCheckin)
      .filter(h => h !== undefined) as number[];

    if (hoursValues.length < this.minSupport) return null;

    // 找到一个合理的阈值
    const avgHours = hoursValues.reduce((a, b) => a + b, 0) / hoursValues.length;
    const maxHours = Math.max(...hoursValues);

    return {
      feature: "booking.hoursBeforeCheckin",
      operator: "lte",
      value: Math.max(72, maxHours + 24)
    };
  }

  private extractFeatures(context: any): Record<string, any> {
    const features: Record<string, any> = {};

    if (context.booking) {
      if (context.booking.status) features["booking.status"] = context.booking.status;
      if (context.booking.channel) features["booking.channel"] = context.booking.channel;
    }

    if (context.payment) {
      if (context.payment.method) features["payment.method"] = context.payment.method;
      if (context.payment.status) features["payment.status"] = context.payment.status;
    }

    return features;
  }

  private createRule(
    action: string,
    conditions: RuleCondition[],
    allEpisodes: EpisodeRecord[],
    successEpisodes: EpisodeRecord[]
  ): SemanticRule {
    const confidence = successEpisodes.length / allEpisodes.length;
    const id = `rule:${action}:${Date.now()}`;

    return {
      id,
      name: `IF ${conditions.map(c => `${c.feature} ${c.operator} ${c.value}`).join(" AND ")} THEN ${action}`,
      conditions,
      action,
      confidence,
      support: successEpisodes.length,
      createdAt: Date.now(),
      lastUsedAt: Date.now()
    };
  }
}
