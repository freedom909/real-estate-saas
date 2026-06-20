
import { WorldState, GoalState } from "../state/world-state";

export interface Episode {
  id: string;
  timestamp: number;
  goal: GoalState;
  state: WorldState;
  action: {
    name: string;
    parameters: Record<string, any>;
  };
  outcome: {
    success: boolean;
    newState: WorldState;
    reward: number;
  };
  duration: number;
}

export interface EpisodeFilter {
  goalName?: string;
  actionName?: string;
  successOnly?: boolean;
  startTime?: number;
  endTime?: number;
}

export class EpisodicMemory {
  private episodes: Map<string, Episode> = new Map();
  private recentEpisodes: string[] = [];
  private maxRecent: number = 1000;

  recordEpisode(
    goal: GoalState,
    state: WorldState,
    action: { name: string; parameters: Record<string, any> },
    outcome: Episode["outcome"],
    duration: number
  ): Episode {
    const episode: Episode = {
      id: `episode:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      goal,
      state,
      action,
      outcome,
      duration
    };

    this.episodes.set(episode.id, episode);
    this.recentEpisodes.unshift(episode.id);

    if (this.recentEpisodes.length > this.maxRecent) {
      const removed = this.recentEpisodes.pop()!;
      this.episodes.delete(removed);
    }

    return episode;
  }

  getEpisode(id: string): Episode | undefined {
    return this.episodes.get(id);
  }

  getRecentEpisodes(limit: number = 100): Episode[] {
    return this.recentEpisodes
      .slice(0, limit)
      .map(id => this.episodes.get(id)!)
      .filter(Boolean);
  }

  findSimilarEpisodes(
    goal: GoalState,
    state: WorldState,
    limit: number = 10
  ): Episode[] {
    const similar: Array<{ episode: Episode; score: number }> = [];

    for (const episode of this.episodes.values()) {
      let score = 0;

      if (episode.goal.entity === goal.entity &&
          episode.goal.field === goal.field &&
          episode.goal.value === goal.value) {
        score += 0.5;
      }

      if (episode.state[goal.entity]) {
        score += 0.3;
      }

      if (score > 0) {
        similar.push({ episode, score });
      }
    }

    return similar
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.episode);
  }

  getEpisodesByFilter(filter: EpisodeFilter): Episode[] {
    let results = Array.from(this.episodes.values());

    if (filter.goalName) {
      results = results.filter(e => e.goal.field === filter.goalName);
    }

    if (filter.actionName) {
      results = results.filter(e => e.action.name === filter.actionName);
    }

    if (filter.successOnly) {
      results = results.filter(e => e.outcome.success);
    }

    if (filter.startTime) {
      results = results.filter(e => e.timestamp >= filter.startTime!);
    }

    if (filter.endTime) {
      results = results.filter(e => e.timestamp <= filter.endTime!);
    }

    return results.sort((a, b) => b.timestamp - a.timestamp);
  }

  getEpisodeSummary(): {
    totalEpisodes: number;
    successRate: number;
    topActions: Array<{ name: string; count: number; successRate: number }>;
    averageDuration: number;
  } {
    const episodes = Array.from(this.episodes.values());
    if (episodes.length === 0) {
      return {
        totalEpisodes: 0,
        successRate: 0,
        topActions: [],
        averageDuration: 0
      };
    }

    const successful = episodes.filter(e => e.outcome.success).length;
    const successRate = successful / episodes.length;

    const actionStats = new Map<string, { count: number; success: number }>();
    for (const episode of episodes) {
      const stats = actionStats.get(episode.action.name) || { count: 0, success: 0 };
      stats.count++;
      if (episode.outcome.success) stats.success++;
      actionStats.set(episode.action.name, stats);
    }

    const topActions = Array.from(actionStats.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        successRate: stats.success / stats.count
      }));

    const averageDuration = episodes.reduce((sum, e) => sum + e.duration, 0) / episodes.length;

    return {
      totalEpisodes: episodes.length,
      successRate,
      topActions,
      averageDuration
    };
  }
}
