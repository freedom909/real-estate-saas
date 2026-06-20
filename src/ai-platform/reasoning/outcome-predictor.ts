
/**
 * Outcome Predictor - 经验推理核心！
 *
 * 在执行前先预测结果！
 *
 * Retrieve Similar Episodes
 *      ↓
 * Predict Outcome for each Action
 *      ↓
 * Choose Action with highest predicted chance
 */

import { EpisodeRecord, ActionSpec } from "../memory/episodic/episode-record";
import { EpisodeSimilarity } from "./episode-retriever";

export interface Prediction {
  action: ActionSpec;
  successProbability: number;
  expectedReward: number;
  evidence: Array<{
    episode: EpisodeRecord;
    similarity: number;
    outcome: boolean;
  }>;
}

export class OutcomePredictor {
  // 不同 Action 的历史结果统计
  private actionStats: Map<string, {
    attempts: number;
    successes: number;
    totalReward: number;
  }> = new Map();

  /**
   * 从相似 Episode 中预测结果
   */
  predict(
    similarEpisodes: EpisodeSimilarity[],
    possibleActions: ActionSpec[]
  ): Prediction[] {
    const predictions: Prediction[] = [];

    for (const action of possibleActions) {
      // 找用过这个 Action 的相似 Episode
      const relevantEpisodes = similarEpisodes.filter(
        sim => sim.episode.action.name === action.name
      );

      const prediction = this.predictForAction(action, relevantEpisodes);
      predictions.push(prediction);
    }

    // 也加入历史统计作为 baseline
    for (const action of possibleActions) {
      if (!predictions.find(p => p.action.name === action.name)) {
        const baselinePred = this.predictFromStats(action);
        predictions.push(baselinePred);
      }
    }

    return predictions;
  }

  private predictForAction(
    action: ActionSpec,
    similarEpisodes: EpisodeSimilarity[]
  ): Prediction {
    if (similarEpisodes.length === 0) {
      return {
        action,
        successProbability: 0.5, // 不确定
        expectedReward: 0,
        evidence: []
      };
    }

    // 加权平均
    let totalWeight = 0;
    let weightedSuccess = 0;
    let weightedReward = 0;
    const evidence: Array<{ episode: EpisodeRecord; similarity: number; outcome: boolean }> = [];

    for (const sim of similarEpisodes) {
      totalWeight += sim.similarity;
      weightedSuccess += sim.similarity * (sim.episode.outcome.success ? 1 : 0);
      weightedReward += sim.similarity * sim.episode.outcome.reward;
      evidence.push({
        episode: sim.episode,
        similarity: sim.similarity,
        outcome: sim.episode.outcome.success
      });
    }

    const successProbability = totalWeight > 0 ? weightedSuccess / totalWeight : 0.5;
    const expectedReward = totalWeight > 0 ? weightedReward / totalWeight : 0;

    return {
      action,
      successProbability,
      expectedReward,
      evidence
    };
  }

  private predictFromStats(action: ActionSpec): Prediction {
    const stats = this.actionStats.get(action.name);

    if (!stats) {
      return {
        action,
        successProbability: 0.5,
        expectedReward: 0,
        evidence: []
      };
    }

    return {
      action,
      successProbability: stats.successes / stats.attempts,
      expectedReward: stats.totalReward / stats.attempts,
      evidence: []
    };
  }

  /**
   * 记录真实结果，用来改进预测
   */
  recordOutcome(action: ActionSpec, success: boolean, reward: number): void {
    const current = this.actionStats.get(action.name) || {
      attempts: 0,
      successes: 0,
      totalReward: 0
    };

    current.attempts++;
    if (success) current.successes++;
    current.totalReward += reward;

    this.actionStats.set(action.name, current);

    console.log(`📊 [OutcomePredictor] ${action.name}: ${current.successes}/${current.attempts} success`);
  }

  getStats(): any {
    const stats: any = {};
    for (const [action, s] of this.actionStats) {
      stats[action] = {
        attempts: s.attempts,
        successRate: s.attempts > 0 ? s.successes / s.attempts : 0
      };
    }
    return stats;
  }
}
