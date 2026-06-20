import { WorldState } from "../state/world-state";
import { MemoryStore, EpisodicMemory } from "../memory/memory-store";
import { KnowledgeGraph } from "../memory/knowledge-graph";
import { BeliefLayer } from "../memory/belief-layer";
import { RuleLearningEngine, ChunkingResult } from "./rule-learning-engine";

export interface LearningEvent {
  id: string;
  type: "episode" | "state_change" | "goal_achieved" | "goal_failed";
  timestamp: number;
  data: any;
  priority: "low" | "medium" | "high";
}

export class AsyncLearningPipeline {
  private eventQueue: LearningEvent[] = [];
  private isRunning = false;
  private memory: MemoryStore;
  private knowledgeGraph: KnowledgeGraph;
  private beliefLayer: BeliefLayer;
  private ruleLearning: RuleLearningEngine;
  private learningInterval: NodeJS.Timeout | null = null;

  constructor(memory: MemoryStore, knowledgeGraph: KnowledgeGraph, beliefLayer: BeliefLayer) {
    this.memory = memory;
    this.knowledgeGraph = knowledgeGraph;
    this.beliefLayer = beliefLayer;
    this.ruleLearning = new RuleLearningEngine(memory, knowledgeGraph, beliefLayer);
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("🧠 [AsyncLearning] Starting asynchronous learning pipeline...");
    
    // 后台学习线程
    this.learningInterval = setInterval(() => {
      this.processLearningQueue();
    }, 2000); // 每2秒处理一次学习队列
  }

  stop(): void {
    this.isRunning = false;
    if (this.learningInterval) {
      clearInterval(this.learningInterval);
      this.learningInterval = null;
    }
    console.log("⏹️ [AsyncLearning] Learning pipeline stopped.");
  }

  submitEpisode(
    episode: EpisodicMemory,
    stateBefore: WorldState,
    stateAfter: WorldState
  ): void {
    const event: LearningEvent = {
      id: `learning-event:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`,
      type: "episode",
      timestamp: Date.now(),
      data: { episode, stateBefore, stateAfter },
      priority: episode.outcome === "failure" ? "high" : "medium"
    };

    this.eventQueue.push(event);
    
    // 高优先级事件立即处理
    if (event.priority === "high") {
      setTimeout(() => this.processLearningQueue(), 100);
    }
    
    console.log(`📥 [AsyncLearning] Episode queued (priority: ${event.priority}): ${episode.event}`);
  }

  private async processLearningQueue(): Promise<void> {
    if (!this.isRunning || this.eventQueue.length === 0) return;

    // 按优先级排序
    this.eventQueue.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority] || a.timestamp - b.timestamp;
    });

    const event = this.eventQueue.shift()!;
    console.log(`⚙️ [AsyncLearning] Processing: ${event.type} (${event.id})`);

    try {
      if (event.type === "episode") {
        const { episode, stateBefore, stateAfter } = event.data;
        await this.ruleLearning.chunking(episode, stateBefore, stateAfter);
      }
    } catch (error) {
      console.error(`❌ [AsyncLearning] Error processing event:`, error);
    }
  }

  getLearningPipelineSummary() {
    return {
      isRunning: this.isRunning,
      queueDepth: this.eventQueue.length,
      ruleLearning: this.ruleLearning.getRuleLearningSummary()
    };
  }
}
