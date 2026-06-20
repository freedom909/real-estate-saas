
/**
 * Action Ranker V2 - 考虑业务价值！
 *
 * 不再只有:
 *  score = 0.7 * successRate + 0.3 * reward
 *
 * 而是:
 *  score = 0.6 * successRate + 0.4 * businessValue
 *
 * 这样 Agent 会考虑：
 *  - 90% 成功率, 价值 +5 的动作
 *  - 50% 成功率, 价值 +50 的动作 (值得冒险！)
 */

import { Prediction } from "./outcome-predictor-v2";
import { BusinessRewardFunction } from "./business-rewards";

export interface RankedAction {
  action: Prediction;
  rank: number;
  finalScore: number;
  reason: string;
}

export class ActionRankerV2 {
  private rewardFn: BusinessRewardFunction;
  private explorationRate: number = 0.15;

  constructor(rewardFn?: BusinessRewardFunction) {
    this.rewardFn = rewardFn || new BusinessRewardFunction();
  }

  /**
   * 排序动作
   */
  rank(predictions: Prediction[]): RankedAction[] {
    const scored: Array<{ prediction: Prediction; score: number }> = [];

    for (const prediction of predictions) {
      const businessValue = this.rewardFn.getBusinessValue(prediction.action.name);
      const normalizedValue = Math.max(0, businessValue) / 50; // 归一化 0-1

      // 核心公式：成功率 60%, 业务价值 40%
      const score = prediction.successProbability * 0.6 + normalizedValue * 0.4;

      scored.push({ prediction, score });
    }

    scored.sort((a, b) => b.score - a.score);

    return scored.map((item, i) => ({
      action: item.prediction,
      rank: i + 1,
      finalScore: item.score,
      reason: this.generateReason(item.prediction, item.score, i + 1)
    }));
  }

  /**
   * 选择动作（ε-Greedy）
   */
  select(ranked: RankedAction[]): RankedAction {
    if (ranked.length === 0) {
      throw new Error("No actions to select");
    }

    // 探索
    if (Math.random() < this.explorationRate && ranked.length > 1) {
      const randomIndex = Math.floor(Math.random() * ranked.length);
      console.log(`🎲 [RankerV2] Explore: ${ranked[randomIndex].action.action.name}`);
      return ranked[randomIndex];
    }

    // 利用
    console.log(`🏆 [RankerV2] Select: ${ranked[0].action.action.name} (score=${ranked[0].finalScore.toFixed(2)})`);
    return ranked[0];
  }

  private generateReason(prediction: Prediction, score: number, rank: number): string {
    const businessValue = this.rewardFn.getBusinessValue(prediction.action.name);

    if (rank === 1) {
      return `Best option! ${(prediction.successProbability * 100).toFixed(0)}% success, ${businessValue} value.`;
    } else if (businessValue > 10 && prediction.successProbability < 0.7) {
      return `High value (${businessValue}), but risky (${(prediction.successProbability * 100).toFixed(0)}%).`;
    } else {
      return `${(prediction.successProbability * 100).toFixed(0)}% success, ${businessValue} value.`;
    }
  }
}
