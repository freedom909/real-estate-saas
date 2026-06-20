
/**
 * Episode 记录
 *
 * 完整的业务经验记录
 */

export interface GoalSpec {
  entity: string;
  field: string;
  value: any;
}

export interface Context {
  booking?: {
    status?: string;
    channel?: string;
    hoursBeforeCheckin?: number;
  };
  payment?: {
    method?: string;
    status?: string;
    amount?: number;
  };
  listing?: {
    available?: boolean;
  };
  [key: string]: any;
}

export interface ActionSpec {
  name: string;
  parameters: Record<string, any>;
}

export interface Outcome {
  success: boolean;
  reward: number;
  newState: any;
  error?: string;
}

export interface EpisodeRecord {
  id: string;
  timestamp: number;

  // 目标
  goal: GoalSpec;

  // 开始状态（重要：用于检索）
  startContext: Context;

  // 动作
  action: ActionSpec;

  // 结果
  outcome: Outcome;

  // 耗时
  duration: number;

  // 标签（用于索引）
  tags: string[];
}

export class EpisodeDatabase {
  private episodes: Map<string, EpisodeRecord> = new Map();
  private index: Map<string, string[]> = new Map(); // tag → episode ids

  /**
   * 记录 Episode
   */
  record(
    goal: GoalSpec,
    startContext: Context,
    action: ActionSpec,
    outcome: Outcome,
    duration: number
  ): EpisodeRecord {
    const id = `ep:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;

    const tags = [
      `goal:${goal.entity}:${goal.field}`,
      `action:${action.name}`,
      `success:${outcome.success}`
    ];

    if (startContext.booking?.channel) {
      tags.push(`channel:${startContext.booking.channel}`);
    }

    if (startContext.payment?.method) {
      tags.push(`payment:${startContext.payment.method}`);
    }

    const episode: EpisodeRecord = {
      id,
      timestamp: Date.now(),
      goal,
      startContext,
      action,
      outcome,
      duration,
      tags
    };

    this.episodes.set(id, episode);

    for (const tag of tags) {
      if (!this.index.has(tag)) {
        this.index.set(tag, []);
      }
      this.index.get(tag)!.push(id);
    }

    console.log(`📝 [EpisodeDB] Recorded: ${id} | ${action.name} | ${outcome.success ? "✅" : "❌"}`);

    return episode;
  }

  /**
   * 检索相似 Episodes
   * 基于：Goal + State + Context + Constraints
   */
  retrieveSimilar(
    goal: GoalSpec,
    context: Context,
    limit: number = 10
  ): EpisodeRecord[] {
    const goalKey = `goal:${goal.entity}:${goal.field}`;
    const candidates = new Set<string>();

    const goalEpisodes = this.index.get(goalKey) || [];
    for (const id of goalEpisodes) {
      candidates.add(id);
    }

    const results: Array<{ episode: EpisodeRecord; score: number }> = [];

    for (const id of candidates) {
      const episode = this.episodes.get(id);
      if (!episode) continue;

      const score = this.calculateSimilarity(goal, context, episode);
      results.push({ episode, score });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.episode);
  }

  private calculateSimilarity(
    goal: GoalSpec,
    context: Context,
    episode: EpisodeRecord
  ): number {
    let score = 0;

    // Goal 匹配（基础分）
    if (episode.goal.entity === goal.entity && episode.goal.field === goal.field) {
      score += 30;
    }

    // Booking Context 匹配
    if (context.booking && episode.startContext.booking) {
      if (context.booking.status === episode.startContext.booking.status) {
        score += 20;
      }
      if (context.booking.channel === episode.startContext.booking.channel) {
        score += 15;
      }
    }

    // Payment Context 匹配
    if (context.payment && episode.startContext.payment) {
      if (context.payment.status === episode.startContext.payment.status) {
        score += 15;
      }
      if (context.payment.method === episode.startContext.payment.method) {
        score += 10;
      }
    }

    // Success 优先
    if (episode.outcome.success) {
      score += 10;
    }

    return score;
  }

  /**
   * 获取统计
   */
  getStats(): {
    total: number;
    byAction: Record<string, { count: number; success: number; avgReward: number }>;
    successRate: number;
  } {
    const total = this.episodes.size;
    const byAction: any = {};
    let successCount = 0;

    for (const episode of this.episodes.values()) {
      const action = episode.action.name;
      if (!byAction[action]) {
        byAction[action] = { count: 0, success: 0, totalReward: 0 };
      }
      byAction[action].count++;
      if (episode.outcome.success) {
        byAction[action].success++;
        successCount++;
      }
      byAction[action].totalReward += episode.outcome.reward;
    }

    for (const action of Object.keys(byAction)) {
      byAction[action].avgReward = byAction[action].totalReward / byAction[action].count;
      delete byAction[action].totalReward;
    }

    return {
      total,
      byAction,
      successRate: total > 0 ? successCount / total : 0
    };
  }

  /**
   * 获取所有 Episodes
   */
  getAll(limit: number = 100): EpisodeRecord[] {
    return Array.from(this.episodes.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
}
