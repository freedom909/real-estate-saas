
import { ReasoningStep } from "../reasoning/cognitive-reasoning-engine";
import { HTNSkill, HTNSkillLibrary } from "../memory/htn-skill-library";
import { GoalState } from "../state/world-state";

export interface ReasoningTrace {
  steps: ReasoningStep[];
  startState: any;
  endState: any;
  goalAchieved: boolean;
  timestamp: number;
}

export interface Chunk {
  id: string;
  name: string;
  conditions: string[];
  actions: string[];
  originalTrace: ReasoningTrace;
  utility: number;
  usageCount: number;
  successCount: number;
  timestamp: number;
}

export class SOARChunkingEngine {
  private chunks: Map<string, Chunk> = new Map();
  private skillLibrary: HTNSkillLibrary;
  private reasoningTraces: ReasoningTrace[] = [];
  private chunkingThreshold: number = 3; // 多少次推理后开始压缩

  constructor(skillLibrary: HTNSkillLibrary) {
    this.skillLibrary = skillLibrary;
  }

  recordReasoningTrace(trace: ReasoningTrace): void {
    this.reasoningTraces.push(trace);
    console.log(`📝 [SOAR Chunking] Recorded reasoning trace: ${trace.steps.length} steps`);

    // 检查是否有足够的类似推理可以进行压缩
    this.tryChunking();
  }

  // 真正的 SOAR Chunking：推理压缩
  private tryChunking(): void {
    console.log("🔍 [SOAR Chunking] Checking for chunking opportunities");

    // 找到相似的推理轨迹
    const similarTraces = this.findSimilarTraces();

    if (similarTraces.length >= this.chunkingThreshold) {
      console.log(`🎯 [SOAR Chunking] Found ${similarTraces.length} similar traces - triggering chunking!`);
      this.createChunk(similarTraces);
    }
  }

  private findSimilarTraces(): ReasoningTrace[][] {
    const groups: ReasoningTrace[][] = [];

    for (const trace of this.reasoningTraces) {
      let added = false;
      
      for (const group of groups) {
        if (this.tracesAreSimilar(group[0], trace)) {
          group.push(trace);
          added = true;
          break;
        }
      }

      if (!added) {
        groups.push([trace]);
      }
    }

    return groups.filter(g => g.length >= this.chunkingThreshold);
  }

  private tracesAreSimilar(trace1: ReasoningTrace, trace2: ReasoningTrace): boolean {
    // 简化的相似性检查：目标类型和推理步骤数量相似
    if (trace1.steps.length !== trace2.steps.length) return false;
    
    const typeOverlap = trace1.steps.filter(s1 => 
      trace2.steps.some(s2 => s1.type === s2.type)
    ).length;

    return typeOverlap >= trace1.steps.length * 0.7;
  }

  // SOAR Chunking 核心：推理压缩
  private createChunk(similarTraces: ReasoningTrace[]): Chunk {
    console.log("🧩 [SOAR Chunking] Creating new chunk by compressing reasoning");

    // 找出共同的前置条件
    const commonConditions = this.findCommonConditions(similarTraces);
    
    // 找出共同的结论/动作
    const commonActions = this.findCommonActions(similarTraces);

    const chunkId = `chunk:${Date.now()}`;
    const chunk: Chunk = {
      id: chunkId,
      name: this.generateChunkName(commonConditions, commonActions),
      conditions: commonConditions,
      actions: commonActions,
      originalTrace: similarTraces[0],
      utility: 0.5,
      usageCount: 0,
      successCount: 0,
      timestamp: Date.now()
    };

    this.chunks.set(chunkId, chunk);
    console.log(`✅ [SOAR Chunking] Created chunk: ${chunk.name} with ${chunk.conditions.length} conditions and ${chunk.actions.length} actions`);

    // 转换为 HTN 技能（Proceduralization）
    this.createSkillFromChunk(chunk);

    return chunk;
  }

  private findCommonConditions(traces: ReasoningTrace[]): string[] {
    // 找到所有前置条件的交集
    const allConditions = traces.map(trace => 
      trace.steps.flatMap(step => step.premises)
    );

    // 简单实现：找到出现最频繁的条件
    const conditionCounts = new Map<string, number>();
    for (const conditions of allConditions) {
      for (const cond of conditions) {
        conditionCounts.set(cond, (conditionCounts.get(cond) || 0) + 1);
      }
    }

    return Array.from(conditionCounts.entries())
      .filter(([_, count]) => count >= traces.length * 0.7)
      .map(([cond, _]) => cond);
  }

  private findCommonActions(traces: ReasoningTrace[]): string[] {
    const allConclusions = traces.map(trace => 
      trace.steps.map(step => step.conclusion)
    );

    const conclusionCounts = new Map<string, number>();
    for (const conclusions of allConclusions) {
      for (const concl of conclusions) {
        conclusionCounts.set(concl, (conclusionCounts.get(concl) || 0) + 1);
      }
    }

    return Array.from(conclusionCounts.entries())
      .filter(([_, count]) => count >= traces.length * 0.7)
      .map(([concl, _]) => concl);
  }

  private generateChunkName(conditions: string[], actions: string[]): string {
    const condStr = conditions.length > 0 ? conditions[0].substring(0, 10) : "none";
    const actionStr = actions.length > 0 ? actions[0].substring(0, 10) : "none";
    return `Chunk_${condStr}_${actionStr}`;
  }

  // Proceduralization：从 Chunk 创建 Skill
  private createSkillFromChunk(chunk: Chunk): HTNSkill {
    console.log(`🔧 [SOAR Chunking] Proceduralizing chunk into skill: ${chunk.name}`);

    const skill = this.skillLibrary.registerSkill({
      id: `skill:${chunk.id}`,
      name: chunk.name,
      description: `Learned from chunking ${chunk.usageCount} reasoning traces`,
      preconditions: chunk.conditions.map(c => ({
        entity: "system",
        field: "condition",
        value: c,
        operator: "eq" as any
      })),
      effects: chunk.actions.map(a => ({
        entity: "system",
        field: "result",
        value: a
      })),
      subSkills: [],
      successRate: chunk.utility,
      executionCount: 0
    });

    return skill;
  }

  getChunk(chunkId: string): Chunk | undefined {
    return this.chunks.get(chunkId);
  }

  recordChunkUsage(chunkId: string, success: boolean): void {
    const chunk = this.chunks.get(chunkId);
    if (!chunk) return;

    chunk.usageCount++;
    if (success) {
      chunk.successCount++;
    }

    // 更新效用值（简单强化学习）
    chunk.utility = chunk.successCount / Math.max(chunk.usageCount, 1);
    console.log(`📊 [SOAR Chunking] Chunk ${chunk.name} utility: ${chunk.utility.toFixed(2)}`);
  }

  getChunksByUtility(limit: number = 10): Chunk[] {
    return Array.from(this.chunks.values())
      .sort((a, b) => b.utility - a.utility)
      .slice(0, limit);
  }

  getChunkingSummary(): {
    totalChunks: number;
    totalReasoningTraces: number;
    topChunks: Array<{ name: string; utility: number; usageCount: number }>;
  } {
    const topChunks = this.getChunksByUtility(5).map(c => ({
      name: c.name,
      utility: c.utility,
      usageCount: c.usageCount
    }));

    return {
      totalChunks: this.chunks.size,
      totalReasoningTraces: this.reasoningTraces.length,
      topChunks
    };
  }
}
