
/**
 * Policy Learner - 真正的策略学习！
 *
 * Episode → Rule Extraction → Policy Update → Future Decisions Change
 */

import { EpisodeRecord } from "../memory/episodic/episode-record";
import { PolicyStore } from "../memory/policy-store";
import { RuleExtractor } from "../reasoning/rule-extractor";
import { SemanticRule } from "../reasoning/semantic-rule";

export class PolicyLearner {
  private policyStore: PolicyStore;
  private ruleExtractor: RuleExtractor;
  private learningInterval: number = 5; // 每5个Episode学习一次
  private lastLearnedAt: number = 0;

  constructor() {
    this.policyStore = new PolicyStore();
    this.ruleExtractor = new RuleExtractor();
  }

  /**
   * 学习 - 调用这个函数，Policy 会自动更新！
   */
  learnFromEpisodes(episodes: EpisodeRecord[], force: boolean = false): void {
    const episodeCount = episodes.length;

    if (!force && episodeCount - this.lastLearnedAt < this.learningInterval) {
      return; // 还没到学习时间
    }

    console.log(`\n🧠 [PolicyLearner] Starting policy learning with ${episodeCount} episodes...`);

    // 1. 提取规则
    const rules = this.ruleExtractor.extractRules(episodes);

    if (rules.length > 0) {
      // 2. 更新 Policy
      this.policyStore.addRules(rules);
      console.log(`✅ [PolicyLearner] Added ${rules.length} rules to policy.`);
    }

    this.lastLearnedAt = episodeCount;

    const stats = this.policyStore.getStats();
    console.log(`📊 [PolicyLearner] Policy stats: ${stats.totalRules} rules total, ${stats.highConfidenceRules} high-confidence.`);
  }

  /**
   * 获取匹配当前状态的策略动作
   */
  getBestActionForState(state: any): { action?: string; rule?: SemanticRule; confidence: number } {
    const matchingRules = this.policyStore.findMatchingRules(state);

    if (matchingRules.length > 0) {
      const bestRule = matchingRules[0];
      console.log(`🎯 [PolicyLearner] Best matching rule: ${bestRule.name}`);
      return {
        action: bestRule.action,
        rule: bestRule,
        confidence: bestRule.confidence
      };
    }

    return { confidence: 0 };
  }

  /**
   * 记录反馈（用于在线学习）
   */
  recordFeedback(ruleId: string | undefined, success: boolean): void {
    if (ruleId) {
      this.policyStore.recordRuleUsed(ruleId, success);
    }
  }

  getPolicyStore(): PolicyStore {
    return this.policyStore;
  }
}
