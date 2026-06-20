
/**
 * Episode Vector Database - 真正的向量检索！
 *
 * 不再是：
 *   goal.entity === ...
 *
 * 而是：
 *   cosineSimilarity(currentVector, episodeVector)
 *
 * 真正根据状态找相似经验！
 */

import { EpisodeRecord } from "./episodic/episode-record";
import { StateEncoderV2, StateVector } from "../reasoning/state-encoder";

export interface EpisodeVector {
  episode: EpisodeRecord;
  vector: StateVector;
  timestamp: number;
}

export class EpisodeVectorDB {
  private episodes: EpisodeVector[] = [];
  private stateEncoder: StateEncoderV2 = new StateEncoderV2();

  /**
   * 添加 Episode 和它的向量
   */
  add(episode: EpisodeRecord): void {
    const vector = this.stateEncoder.encode(episode.startContext);
    this.episodes.push({
      episode,
      vector,
      timestamp: Date.now()
    });
  }

  /**
   * 检索最相似的 K 个 Episode（余弦相似度）
   */
  retrieveSimilar(
    currentContext: any,
    topK: number = 5,
    filter?: { goalEntity?: string; successOnly?: boolean }
  ): EpisodeRecord[] {
    if (this.episodes.length === 0) return [];

    const currentVector = this.stateEncoder.encode(currentContext);

    // 计算相似度
    const scored: Array<{
      episode: EpisodeRecord;
      similarity: number;
    }> = [];

    for (const epVec of this.episodes) {
      // 应用过滤
      if (filter) {
        if (
          filter.goalEntity &&
          epVec.episode.goal.entity !== filter.goalEntity
        ) {
          continue;
        }

        if (
          filter.successOnly &&
          !epVec.episode.outcome.success
        ) {
          continue;
        }
      }

      // 计算余弦相似度
      const similarity = this.stateEncoder.cosineSimilarity(
        currentVector,
        epVec.vector
      );

      scored.push({
        episode: epVec.episode,
        similarity
      });
    }

    // 按相似度排序
    scored.sort((a, b) => b.similarity - a.similarity);

    // 取 Top K
    const topEpisodes = scored.slice(0, topK).map(s => s.episode);

    if (topEpisodes.length > 0) {
      console.log(`    [VectorDB] Retrieved ${topEpisodes.length} episodes (top sim=${scored[0].similarity.toFixed(3)})`);
    }

    return topEpisodes;
  }

  /**
   * 从相似 Episode 中学习经验
   */
  getExperienceStats(
    similarEpisodes: EpisodeRecord[]
  ): Map<
    string,
    {
      attempts: number;
      successes: number;
      avgReward: number;
    }
  > {
    const stats = new Map();

    for (const ep of similarEpisodes) {
      const action = ep.action.name;

      if (!stats.has(action)) {
        stats.set(action, {
          attempts: 0,
          successes: 0,
          avgReward: 0,
          totalReward: 0
        });
      }

      const entry = stats.get(action)!;
      entry.attempts++;
      entry.totalReward += ep.outcome.reward;

      if (ep.outcome.success) {
        entry.successes++;
      }
    }

    // 计算平均
    for (const [action, entry] of stats) {
      entry.avgReward = entry.totalReward / entry.attempts;
      delete entry.totalReward;
    }

    return stats;
  }

  getAll(): EpisodeRecord[] {
    return this.episodes.map(e => e.episode);
  }

  size(): number {
    return this.episodes.length;
  }
}
