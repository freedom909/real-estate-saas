import { WorldState, GoalState } from "../state/world-state";
import { MemoryStore, EpisodicMemory } from "./memory-store";

export interface Knowledge {
  id: string;
  type: "concept" | "pattern" | "skill" | "heuristic";
  concept: string;
  confidence: number;
  createdAt: number;
  lastUsedAt: number;
  useCount: number;
  metadata?: any;
}

export interface ConceptKnowledge extends Knowledge {
  type: "concept";
  facts: {
    reliability?: number;
    status?: string;
    patterns?: string[];
    [key: string]: any;
  };
}

export interface SkillKnowledge extends Knowledge {
  type: "skill";
  skillId: string;
  successRate: number;
  executionCount: number;
  averageSteps?: string[];
  preconditions?: string[];
  effects?: string[];
}

export interface PatternKnowledge extends Knowledge {
  type: "pattern";
  pattern: string;
  frequency: number;
  observations: string[];
}

export class KnowledgeBase {
  private knowledge: Map<string, Knowledge> = new Map();
  private memory: MemoryStore;
  private inductionInterval: number = 5;
  private lastInduction: number = 0;

  constructor(memory: MemoryStore) {
    this.memory = memory;
  }

  // === 知识归纳：从 Experience → Knowledge ===
  async induceKnowledge(): Promise<Knowledge[]> {
    console.log("🧠 [KnowledgeBase] Inducing knowledge from experience...");
    
    const now = Date.now();
    const newKnowledge: Knowledge[] = [];

    // 跳过归纳如果还没到时间
    if (now - this.lastInduction < 1000 * 60 * 1 && this.knowledge.size > 0) {
      return this.getAllKnowledge();
    }

    // 1. 归纳服务可靠性知识
    const serviceKnowledge = this.induceServiceReliability();
    newKnowledge.push(...serviceKnowledge);

    // 2. 归纳成功模式知识
    const patternKnowledge = this.induceSuccessPatterns();
    newKnowledge.push(...patternKnowledge);

    // 3. 归纳技能/计划知识
    const skillKnowledge = this.induceSkills();
    newKnowledge.push(...skillKnowledge);

    this.lastInduction = now;
    console.log(`✅ [KnowledgeBase] Induced ${newKnowledge.length} new knowledge items`);
    
    return newKnowledge;
  }

  // === 服务可靠性归纳 ===
  private induceServiceReliability(): ConceptKnowledge[] {
    const knowledge: ConceptKnowledge[] = [];
    
    // 从 Episodic Memory 找出所有服务调用
    const serviceEvents = this.memory.getAllMemories().filter(m => 
      m.type === "episodic" && 
      ((m as EpisodicMemory).event.startsWith("Executed") || 
       (m as EpisodicMemory).event.startsWith("Error"))
    );

    // 按服务分组统计
    const serviceStats = new Map<string, { success: number; total: number }>();
    for (const event of serviceEvents) {
      const epEvent = event as EpisodicMemory;
      const serviceMatch = epEvent.event.match(/Executed (\w+)\./) || 
                          epEvent.event.match(/Error in (\w+)\./);
      if (serviceMatch) {
        const serviceName = serviceMatch[1];
        if (!serviceStats.has(serviceName)) {
          serviceStats.set(serviceName, { success: 0, total: 0 });
        }
        const stats = serviceStats.get(serviceName)!;
        stats.total++;
        if (epEvent.outcome === "success") stats.success++;
      }
    }

    // 生成服务可靠性知识
    for (const [serviceName, stats] of serviceStats) {
      const reliability = stats.total > 0 ? stats.success / stats.total : 1;
      const knowledgeId = `concept:service:${serviceName}`;
      
      const existing = this.getKnowledge(knowledgeId) as ConceptKnowledge;
      if (existing) {
        // 更新现有知识
        existing.facts.reliability = reliability;
        existing.confidence = Math.min(1, existing.confidence + 0.1);
        existing.lastUsedAt = Date.now();
        this.updateKnowledge(existing);
      } else {
        // 创建新知识
        const newKnowledge: ConceptKnowledge = {
          id: knowledgeId,
          type: "concept",
          concept: `service:${serviceName}`,
          confidence: Math.min(1, stats.total / 10), // 置信度随观察次数增长
          createdAt: Date.now(),
          lastUsedAt: Date.now(),
          useCount: 0,
          facts: {
            reliability,
            status: reliability < 0.5 ? "unstable" : reliability < 0.8 ? "degraded" : "healthy",
            totalCalls: stats.total,
            successCount: stats.success
          }
        };
        this.addKnowledge(newKnowledge);
        knowledge.push(newKnowledge);
      }
    }

    return knowledge;
  }

  // === 成功模式归纳 ===
  private induceSuccessPatterns(): PatternKnowledge[] {
    const knowledge: PatternKnowledge[] = [];
    
    // 找出成功的序列模式
    const successEvents = this.memory.getAllMemories().filter(m => 
      m.type === "episodic" && 
      (m as EpisodicMemory).outcome === "success"
    );

    if (successEvents.length >= 3) {
      const patternId = "pattern:general-success";
      const existing = this.getKnowledge(patternId) as PatternKnowledge;
      
      if (existing) {
        existing.frequency++;
        existing.lastUsedAt = Date.now();
        this.updateKnowledge(existing);
      } else {
        knowledge.push({
          id: patternId,
          type: "pattern",
          concept: "execution:success-pattern",
          pattern: "complete-steps-in-order",
          frequency: successEvents.length,
          observations: successEvents.slice(0, 10).map(m => m.id),
          confidence: 0.7,
          createdAt: Date.now(),
          lastUsedAt: Date.now(),
          useCount: 0
        });
      }
    }

    return knowledge;
  }

  // === 技能/计划学习 ===
  private induceSkills(): SkillKnowledge[] {
    const knowledge: SkillKnowledge[] = [];
    
    // 这里是简化版的技能学习
    // 实际上应该学习完整的计划模式
    const successMemories = this.memory.getAllMemories().filter(m => 
      m.type === "episodic" && 
      (m as EpisodicMemory).outcome === "success" && 
      (m as EpisodicMemory).event.startsWith("Executed")
    );

    // 简单的成功统计
    const skillStats = new Map<string, { success: number; total: number }>();
    for (const memory of successMemories) {
      const epMem = memory as EpisodicMemory;
      const skillMatch = epMem.event.match(/Executed ([\w.]+)/);
      if (skillMatch) {
        const skillId = skillMatch[1];
        if (!skillStats.has(skillId)) {
          skillStats.set(skillId, { success: 0, total: 0 });
        }
        skillStats.get(skillId)!.success++;
        skillStats.get(skillId)!.total++;
      }
    }

    for (const [skillId, stats] of skillStats) {
      const knowledgeId = `skill:${skillId}`;
      const existing = this.getKnowledge(knowledgeId) as SkillKnowledge;
      
      if (existing) {
        existing.executionCount = stats.total;
        existing.successRate = stats.success / stats.total;
        existing.lastUsedAt = Date.now();
        this.updateKnowledge(existing);
      } else {
        knowledge.push({
          id: knowledgeId,
          type: "skill",
          concept: `skill:${skillId}`,
          skillId,
          successRate: stats.success / stats.total,
          executionCount: stats.total,
          confidence: Math.min(1, stats.total / 5),
          createdAt: Date.now(),
          lastUsedAt: Date.now(),
          useCount: 0
        });
      }
    }

    return knowledge;
  }

  // === CRUD 操作 ===
  addKnowledge(knowledge: Knowledge): void {
    this.knowledge.set(knowledge.id, knowledge);
    console.log(`📚 [KnowledgeBase] Added: ${knowledge.concept} (confidence: ${knowledge.confidence})`);
  }

  getKnowledge(id: string): Knowledge | undefined {
    const k = this.knowledge.get(id);
    if (k) {
      k.lastUsedAt = Date.now();
      k.useCount++;
    }
    return k;
  }

  getKnowledgeByConcept(conceptPrefix: string): Knowledge[] {
    return Array.from(this.knowledge.values())
      .filter(k => k.concept.startsWith(conceptPrefix))
      .sort((a, b) => b.confidence - a.confidence);
  }

  getServiceHealth(serviceName: string): ConceptKnowledge | undefined {
    return this.getKnowledge(`concept:service:${serviceName}`) as ConceptKnowledge;
  }

  getSkillKnowledge(skillId: string): SkillKnowledge | undefined {
    return this.getKnowledge(`skill:${skillId}`) as SkillKnowledge;
  }

  updateKnowledge(knowledge: Knowledge): void {
    this.knowledge.set(knowledge.id, knowledge);
  }

  getAllKnowledge(): Knowledge[] {
    return Array.from(this.knowledge.values()).sort((a, b) => b.confidence - a.confidence);
  }

  getKnowledgeSummary() {
    const grouped = {
      concept: this.getKnowledgeByConcept("concept:").length,
      skill: this.getKnowledgeByConcept("skill:").length,
      pattern: this.getKnowledgeByConcept("pattern:").length
    };
    
    return {
      total: this.knowledge.size,
      grouped,
      topKnowledge: this.getAllKnowledge().slice(0, 5).map(k => ({
        concept: k.concept,
        confidence: k.confidence,
        useCount: k.useCount
      }))
    };
  }
}
