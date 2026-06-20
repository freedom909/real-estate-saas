
/**
 * Action Ranker - 选择最好的动作！
 *
 * 使用 Prediction 来排序 Action
 */

import { Prediction } from "./outcome-predictor";
import { ActionSpec } from "../memory/episodic/episode-record";

export interface RankedAction {
  action: ActionSpec;
  rank: number; // 1 = best
  successProbability: number;
  expectedReward: number;
  reason: string;
}

export class ActionRanker {
  private explorationRate: number = 0.15; // ε-greedy

  /**
   * 排序动作
   */
  rank(predictions: Prediction[]): RankedAction[] {
    // 先排序
    const sorted = [...predictions].sort((a, b) => {
      // 主要看成功概率，其次看期望 reward
      const scoreA = a.successProbability * 0.7 + Math.max(a.expectedReward, 0) * 0.3;
      const scoreB = b.successProbability * 0.7 + Math.max(b.expectedReward, 0) * 0.3;
      return scoreB - scoreA;
    });

    return sorted.map((pred, i) => ({
      action: pred.action,
      rank: i + 1,
      successProbability: pred.successProbability,
      expectedReward: pred.expectedReward,
      reason: this.generateReason(pred, i + 1)
    }));
  }

  /**
   * 选择动作（ε-greedy）
   */
  select(rankedActions: RankedAction[]): RankedAction {
    if (rankedActions.length === 0) {
      throw new Error("No actions to select");
    }

    // 探索：选随机的
    if (Math.random() < this.explorationRate && rankedActions.length > 1) {
      const randomIndex = Math.floor(Math.random() * rankedActions.length);
      const selected = rankedActions[randomIndex];
      console.log(`🎲 [ActionRanker] Exploring: ${selected.action.name}`);
      return selected;
    }

    // 利用：选最好的
    const best = rankedActions[0];
    console.log(`🏆 [ActionRanker] Selecting best: ${best.action.name} (${(best.successProbability * 100).toFixed(0)}% success)`);

    return best;
  }

  private generateReason(pred: Prediction, rank: number): string {
    if (pred.evidence.length > 0) {
      const successCount = pred.evidence.filter(e => e.outcome).length;
      return `Based on ${pred.evidence.length} similar episode(s), ${successCount} succeeded.`;
    }
    if (rank === 1) {
      return `Highest predicted success rate: ${(pred.successProbability * 100).toFixed(0)}%`;
    }
    return `Success rate: ${(pred.successProbability * 100).toFixed(0)}%`;
  }
}
