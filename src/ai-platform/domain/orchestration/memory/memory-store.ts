import { WorldState, GoalState } from "../state/world-state";

export interface MemoryItem {
  id: string;
  type: "episodic" | "semantic" | "working";
  content: any;
  timestamp: number;
  importance: number;
  tags?: string[];
}

export interface EpisodicMemory extends MemoryItem {
  type: "episodic";
  event: string;
  outcome?: "success" | "failure";
  context?: any;
}

export interface SemanticMemory extends MemoryItem {
  type: "semantic";
  concept: string;
  facts: any[];
}

export interface WorkingMemory extends MemoryItem {
  type: "working";
  currentGoal?: GoalState[];
  currentPlan?: any;
  recentObservations?: any[];
}

export class MemoryStore {
  private episodicMemory: EpisodicMemory[] = [];
  private semanticMemory: SemanticMemory[] = [];
  private workingMemory: WorkingMemory | null = null;
  private maxEpisodicMemory: number = 1000;

  constructor() {
    this.initializeWorkingMemory();
  }

  private initializeWorkingMemory(): void {
    this.workingMemory = {
      id: `working-${Date.now()}`,
      type: "working",
      content: {},
      timestamp: Date.now(),
      importance: 1.0
    };
  }

  addEpisodicMemory(
    event: string,
    outcome: "success" | "failure" = "success",
    importance: number = 0.5,
    context?: any,
    tags?: string[]
  ): void {
    const memory: EpisodicMemory = {
      id: `episodic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "episodic",
      event,
      outcome,
      context,
      content: { event, outcome, context },
      timestamp: Date.now(),
      importance,
      tags
    };

    this.episodicMemory.push(memory);
    if (this.episodicMemory.length > this.maxEpisodicMemory) {
      this.episodicMemory.shift();
    }

    console.log(`📝 Episodic memory added: ${event} (${outcome})`);
  }

  addSemanticMemory(
    concept: string,
    facts: any[],
    importance: number = 0.7,
    tags?: string[]
  ): void {
    const memory: SemanticMemory = {
      id: `semantic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "semantic",
      concept,
      facts,
      content: { concept, facts },
      timestamp: Date.now(),
      importance,
      tags
    };

    this.semanticMemory.push(memory);
    console.log(`🔍 Semantic memory added: ${concept}`);
  }

  updateWorkingMemory(
    updates: Partial<WorkingMemory>
  ): void {
    if (!this.workingMemory) {
      this.initializeWorkingMemory();
    }

    this.workingMemory = {
      ...this.workingMemory,
      ...updates,
      timestamp: Date.now(),
      content: {
        ...this.workingMemory.content,
        ...updates.content
      }
    };

    console.log("💾 Working memory updated");
  }

  getRecentFailures(eventPattern: string, limit: number = 10): EpisodicMemory[] {
    return this.episodicMemory
      .filter(m => m.type === "episodic" && 
                   m.outcome === "failure" && 
                   m.event.includes(eventPattern))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getRecentSuccesses(eventPattern: string, limit: number = 10): EpisodicMemory[] {
    return this.episodicMemory
      .filter(m => m.type === "episodic" && 
                   m.outcome === "success" && 
                   m.event.includes(eventPattern))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getServiceHealth(serviceName: string): { reliability: number; recentFailures: number } {
    const recentFailures = this.getRecentFailures(serviceName, 20);
    const recentSuccesses = this.getRecentSuccesses(serviceName, 20);
    const total = recentFailures.length + recentSuccesses.length;
    
    return {
      reliability: total > 0 ? recentSuccesses.length / total : 1.0,
      recentFailures: recentFailures.length
    };
  }

  getWorkingMemory(): WorkingMemory | null {
    return this.workingMemory;
  }

  getAllMemories(): MemoryItem[] {
    return [
      ...this.episodicMemory,
      ...this.semanticMemory,
      ...(this.workingMemory ? [this.workingMemory] : [])
    ];
  }

  getMemorySummary(): {
    episodicCount: number;
    semanticCount: number;
    recentEvents: EpisodicMemory[];
  } {
    return {
      episodicCount: this.episodicMemory.length,
      semanticCount: this.semanticMemory.length,
      recentEvents: this.episodicMemory
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10)
    };
  }
}
