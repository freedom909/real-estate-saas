
/**
 * Outcome Predictor V2 - 没有数据泄漏！
 *
 * 不再是:
 *  predictForAction(episode) -> use episode.outcome.success
 *
 * 而是:
 *  使用邻居 Episode 的分布
 */

import { EpisodeMatch } from "./episode-retriever-v2";
import { ActionSpec } from "../memory/episodic/episode-record";

export interface Prediction {
  action: ActionSpec;
  successProbability: number;
  expectedReward: number;
  evidenceCount: number;
  confidence: "low" | "medium" | "high";
}

export class OutcomePredictorV2 {
  // 存储每个动作的历史
  private actionHistory: Map<string, Array<{ success: boolean; reward: number; context: any }>> = new Map();

  /**
   * 预测结果 - 没有数据泄漏！
   */
  predict(
    similarEpisodes: EpisodeMatch[],
    possibleActions: ActionSpec[],
    excludeEpisodeId?: string
  ): Prediction[] {
    const predictions: Prediction[] = [];

    for (const action of possibleActions) {
      // 找到相关的历史 Episode
      const relevant = similarEpisodes.filter(e =>
        e.episode.action.name === action.name &&
        e.episode.id !== excludeEpisodeId // 防止泄漏！
      );

      const prediction = this.predictFromRelevant(action, relevant);
      predictions.push(prediction);
    }

    return predictions;
  }

  private predictFromRelevant(
    action: ActionSpec,
    relevantEpisodes: EpisodeMatch[]
  ): Prediction {
    if (relevantEpisodes.length === 0) {
      // 没有相关经验，返回先验
      return {
        action,
        successProbability: 0.5,
        expectedReward: 0,
        evidenceCount: 0,
        confidence: "low"
      };
    }

    // 计算统计
    let totalSuccess = 0;
    let totalReward = 0;

    for (const match of relevantEpisodes) {
      if (match.episode.outcome.success) totalSuccess++;
      totalReward += match.episode.outcome.reward;
    }

    const successRate = totalSuccess / relevantEpisodes.length;
    const avgReward = totalReward / relevantEpisodes.length;

    // 置信度
    let confidence: "low" | "medium" | "high" = "low";
    if (relevantEpisodes.length >= 10) confidence = "high";
    else if (relevantEpisodes.length >= 3) confidence = "medium";

    return {
      action,
      successProbability: successRate,
      expectedReward: avgReward,
      evidenceCount: relevantEpisodes.length,
      confidence
    };
  }

  /**
   * 记录结果（用于学习）
   */
  recordOutcome(action: ActionSpec, success: boolean, reward: number, context: any): void {
    if (!this.actionHistory.has(action.name)) {
      this.actionHistory.set(action.name, []);
    }

    this.actionHistory.get(action.name)!.push({
      success,
      reward,
      context
    });

    console.log(`📊 [PredictorV2] ${action.name}: ${this.getStatsForAction(action.name)}`);
  }

  getStatsForAction(actionName: string): string {
    const history = this.actionHistory.get(actionName) || [];
    if (history.length === 0) return "No history";

    const successCount = history.filter(h => h.success).length;
    const rate = (successCount / history.length * 100).toFixed(0);
    return `${successCount}/${history.length} success (${rate}%)`;
  }
}
