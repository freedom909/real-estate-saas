
import { Episode } from "../memory/episodic-memory";
import { WorldState } from "../state/world-state";

export interface Lesson {
  id: string;
  timestamp: number;
  type: "success" | "failure" | "improvement";
  why: string;
  what: string;
  recommendation: string;
  sourceEpisodes: string[];
}

export interface Reflection {
  id: string;
  timestamp: number;
  episodeId: string;
  lessons: Lesson[];
  summary: string;
}

export class ReflectionEngine {
  private reflections: Map<string, Reflection> = new Map();
  private lessons: Map<string, Lesson> = new Map();

  reflect(episode: Episode): Reflection {
    const lessons: Lesson[] = [];

    if (episode.outcome.success) {
      lessons.push(...this.analyzeSuccess(episode));
    } else {
      lessons.push(...this.analyzeFailure(episode));
    }

    const reflection: Reflection = {
      id: `reflection:${Date.now()}`,
      timestamp: Date.now(),
      episodeId: episode.id,
      lessons,
      summary: this.generateSummary(lessons)
    };

    this.reflections.set(reflection.id, reflection);
    for (const lesson of lessons) {
      this.lessons.set(lesson.id, lesson);
    }

    return reflection;
  }

  private analyzeSuccess(episode: Episode): Lesson[] {
    const lessons: Lesson[] = [];

    lessons.push({
      id: `lesson:success:${Date.now()}`,
      timestamp: Date.now(),
      type: "success",
      why: `Action "${episode.action.name}" succeeded`,
      what: `When ${JSON.stringify(episode.goal)}, using ${episode.action.name} works`,
      recommendation: `Try ${episode.action.name} again in similar situations`,
      sourceEpisodes: [episode.id]
    });

    if (episode.outcome.reward > 0.5) {
      lessons.push({
        id: `lesson:reward:${Date.now()}`,
        timestamp: Date.now(),
        type: "improvement",
        why: `High reward (${episode.outcome.reward})`,
        what: `This pattern yields good outcomes`,
        recommendation: `Prioritize this action when possible`,
        sourceEpisodes: [episode.id]
      });
    }

    return lessons;
  }

  private analyzeFailure(episode: Episode): Lesson[] {
    const lessons: Lesson[] = [];

    lessons.push({
      id: `lesson:failure:${Date.now()}`,
      timestamp: Date.now(),
      type: "failure",
      why: `Action "${episode.action.name}" failed`,
      what: `${episode.action.name} didn't work in this context`,
      recommendation: `Avoid ${episode.action.name} or try alternative`,
      sourceEpisodes: [episode.id]
    });

    return lessons;
  }

  private generateSummary(lessons: Lesson[]): string {
    const successLessons = lessons.filter(l => l.type === "success").length;
    const failureLessons = lessons.filter(l => l.type === "failure").length;

    if (successLessons > 0) {
      return `Reflected on success: ${successLessons} lessons learned`;
    } else if (failureLessons > 0) {
      return `Reflected on failure: ${failureLessons} lessons learned`;
    }
    return `Reflected on episode: ${lessons.length} lessons learned`;
  }

  getRelevantLessons(goal: any, state: WorldState): Lesson[] {
    return Array.from(this.lessons.values())
      .filter(lesson => {
        return lesson.what.includes(JSON.stringify(goal));
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }

  getReflectionSummary(): {
    totalReflections: number;
    totalLessons: number;
    byType: Record<string, number>;
    recentLessons: Lesson[];
  } {
    const byType: Record<string, number> = {
      success: 0,
      failure: 0,
      improvement: 0
    };

    for (const lesson of this.lessons.values()) {
      byType[lesson.type] = (byType[lesson.type] || 0) + 1;
    }

    const recentLessons = Array.from(this.lessons.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    return {
      totalReflections: this.reflections.size,
      totalLessons: this.lessons.size,
      byType,
      recentLessons
    };
  }
}
