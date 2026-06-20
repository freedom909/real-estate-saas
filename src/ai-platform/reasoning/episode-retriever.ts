
/**
 * Episode Retriever - 真正的相似度学习
 *
 * 不是人工写权重: score += 30
 * 而是: 学习特征重要性
 */

import { EpisodeRecord, GoalSpec, Context } from "../memory/episodic/episode-record";

export interface EpisodeSimilarity {
  episode: EpisodeRecord;
  similarity: number;
  featureContributions: Record<string, number>;
}

export interface FeatureWeights {
  [feature: string]: number;
}

export class EpisodeRetriever {
  private episodes: EpisodeRecord[] = [];
  private featureWeights: FeatureWeights = {
    "goal.match": 30,
    "booking.status": 25,
    "payment.method": 20,
    "booking.channel": 10,
    "payment.status": 10,
    "hoursBeforeCheckin": 25 // 这其实是最重要的！
  };

  // 记录反馈，用来学习特征权重
  private feedbackLog: Array<{
    state: any;
    episodeUsed: EpisodeRecord;
    outcome: boolean;
  }> = [];

  addEpisode(episode: EpisodeRecord): void {
    this.episodes.push(episode);
  }

  /**
   * 检索相似 Episode（学习的权重！）
   */
  retrieve(
    goal: GoalSpec,
    currentContext: Context,
    topK: number = 5
  ): EpisodeSimilarity[] {
    const results: EpisodeSimilarity[] = [];

    for (const episode of this.episodes) {
      const { similarity, featureContributions } = this.calculateSimilarity(
        goal,
        currentContext,
        episode
      );

      results.push({
        episode,
        similarity,
        featureContributions
      });
    }

    // 排序（成功的优先）
    results.sort((a, b) => {
      const successBonus = (ep: EpisodeRecord) => ep.outcome.success ? 1000 : 0;
      return (b.similarity + successBonus(b.episode)) - (a.similarity + successBonus(a.episode));
    });

    return results.slice(0, topK);
  }

  private calculateSimilarity(
    goal: GoalSpec,
    context: Context,
    episode: EpisodeRecord
  ): { similarity: number; featureContributions: Record<string, number> } {
    const contributions: Record<string, number> = {};
    let total = 0;

    // Goal 匹配
    if (episode.goal.entity === goal.entity &&
        episode.goal.field === goal.field &&
        episode.goal.value === goal.value) {
      const score = this.featureWeights["goal.match"];
      contributions["goal.match"] = score;
      total += score;
    }

    // Booking Status
    if (context.booking?.status === episode.startContext.booking?.status) {
      const score = this.featureWeights["booking.status"];
      contributions["booking.status"] = score;
      total += score;
    }

    // Payment Method
    if (context.payment?.method === episode.startContext.payment?.method) {
      const score = this.featureWeights["payment.method"];
      contributions["payment.method"] = score;
      total += score;
    }

    // Booking Channel
    if (context.booking?.channel === episode.startContext.booking?.channel) {
      const score = this.featureWeights["booking.channel"];
      contributions["booking.channel"] = score;
      total += score;
    }

    // Hours Before Checkin (最重要的特征！)
    const currentHours = context.booking?.hoursBeforeCheckin;
    const episodeHours = episode.startContext.booking?.hoursBeforeCheckin;
    if (currentHours !== undefined && episodeHours !== undefined) {
      const diff = Math.abs(currentHours - episodeHours);
      const maxHours = 720; // ~30 days
      const normalized = 1 - Math.min(diff / maxHours, 1);
      const score = normalized * this.featureWeights["hoursBeforeCheckin"];
      contributions["hoursBeforeCheckin"] = score;
      total += score;
    }

    return { similarity: total, featureContributions: contributions };
  }

  /**
   * 学习特征权重（从反馈中！）
   *
   * 这样 Agent 可以自己发现：
   * hoursBeforeCheckin 比 channel 重要！
   */
  learnFromFeedback(
    stateBefore: any,
    episodeUsed: EpisodeRecord,
    success: boolean
  ): void {
    this.feedbackLog.push({
      state: stateBefore,
      episodeUsed,
      outcome: success
    });

    // 简单的在线学习：成功就增加相似特征的权重
    if (success) {
      const { featureContributions } = this.calculateSimilarity(
        episodeUsed.goal,
        episodeUsed.startContext,
        episodeUsed
      );

      for (const [feature, contribution] of Object.entries(featureContributions)) {
        if (contribution > 0) {
          this.featureWeights[feature] = (this.featureWeights[feature] || 0) * 1.05;
        }
      }
    }

    console.log("📚 [EpisodeRetriever] Updated weights:", this.featureWeights);
  }

  getEpisodes(): EpisodeRecord[] {
    return [...this.episodes];
  }

  getFeatureWeights(): FeatureWeights {
    return { ...this.featureWeights };
  }
}
