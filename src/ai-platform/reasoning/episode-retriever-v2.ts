
/**
 * Episode Retriever V2 - 使用向量相似度！
 *
 * 不再是手工权重！
 * 使用 StateEncoder + Cosine Similarity
 */

import { EpisodeRecord, GoalSpec, Context } from "../memory/episodic/episode-record";
import { StateEncoder, StateVector } from "./state-encoder";

export interface EpisodeMatch {
  episode: EpisodeRecord;
  similarity: number;
  stateVector: StateVector;
}

export class EpisodeRetrieverV2 {
  private episodes: EpisodeRecord[] = [];
  private stateEncoder: StateEncoder = new StateEncoder();
  private episodeVectors: Map<string, StateVector> = new Map();

  // 用于跟踪：哪些特征真正导致成功
  private featureSuccessCounts: Map<string, number> = new Map();
  private featureTotalCounts: Map<string, number> = new Map();

  addEpisode(episode: EpisodeRecord): void {
    this.episodes.push(episode);

    // 编码并存储状态向量
    const stateVec = this.stateEncoder.encode(episode.startContext);
    this.episodeVectors.set(episode.id, stateVec);

    // 更新特征统计
    this.updateFeatureStats(episode);
  }

  /**
   * 检索相似 Episode - 使用余弦相似度！
   */
  retrieve(
    goal: GoalSpec,
    currentContext: Context,
    topK: number = 5
  ): EpisodeMatch[] {
    const currentVec = this.stateEncoder.encode(currentContext);
    const goalVec = this.stateEncoder.encodeGoal(goal);

    const matches: EpisodeMatch[] = [];

    for (const episode of this.episodes) {
      const epVec = this.episodeVectors.get(episode.id);
      if (!epVec) continue;

      // 计算相似度
      const stateSim = this.stateEncoder.cosineSimilarity(currentVec, epVec);

      // 计算最终分数 (状态相似度 + 目标匹配度 + 成功优先)
      let finalScore = stateSim * 0.6;

      // 目标匹配 (简化版)
      if (episode.goal.entity === goal.entity && episode.goal.field === goal.field) {
        finalScore += 0.3;
      }

      // 成功优先
      if (episode.outcome.success) {
        finalScore += 0.2;
      }

      matches.push({
        episode,
        similarity: finalScore,
        stateVector: epVec
      });
    }

    // 排序并返回 Top K
    matches.sort((a, b) => b.similarity - a.similarity);
    return matches.slice(0, topK);
  }

  /**
   * 真实的反馈学习！
   *
   * 不再是: calculateSimilarity(episode, episode)
   *
   * 而是:
   * 记录哪些特征和成功相关联
   */
  learnFromFeedback(
    currentContext: Context,
    episodeUsed: EpisodeRecord,
    success: boolean
  ): void {
    const currentVec = this.stateEncoder.encode(currentContext);

    // 统计哪些特征在成功的情况下出现
    for (let i = 0; i < currentVec.features.length; i++) {
      const featureName = currentVec.features[i];

      if (!this.featureTotalCounts.has(featureName)) {
        this.featureTotalCounts.set(featureName, 0);
      }
      if (!this.featureSuccessCounts.has(featureName)) {
        this.featureSuccessCounts.set(featureName, 0);
      }

      this.featureTotalCounts.set(featureName,
        this.featureTotalCounts.get(featureName)! + 1);

      if (success) {
        this.featureSuccessCounts.set(featureName,
          this.featureSuccessCounts.get(featureName)! + 1);
      }
    }

    console.log(`🧠 [RetrieverV2] Learned from ${success ? "✅" : "❌"} outcome`);
  }

  /**
   * 获取每个特征的成功率（不是真正的特征重要性）
   * 真正的特征重要性需要 Permutation Importance / SHAP
   */
  getFeatureSuccessRate(): Map<string, number> {
    const rates = new Map<string, number>();

    for (const [feature, total] of this.featureTotalCounts) {
      if (total > 0) {
        const success = this.featureSuccessCounts.get(feature) || 0;
        const rate = success / total;
        rates.set(feature, rate);
      }
    }

    return rates;
  }

  getEpisodes(): EpisodeRecord[] {
    return [...this.episodes];
  }

  private updateFeatureStats(episode: EpisodeRecord): void {
    const vec = this.stateEncoder.encode(episode.startContext);
    for (let i = 0; i < vec.features.length; i++) {
      if (vec.values[i] > 0) {
        const featureName = vec.features[i];
        this.featureTotalCounts.set(featureName,
          (this.featureTotalCounts.get(featureName) || 0) + 1);

        if (episode.outcome.success) {
          this.featureSuccessCounts.set(featureName,
            (this.featureSuccessCounts.get(featureName) || 0) + 1);
        }
      }
    }
  }
}
