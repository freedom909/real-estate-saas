import { WorldState, GoalState } from "../state/world-state";
import { MemoryStore, EpisodicMemory } from "../memory/memory-store";
import { KnowledgeGraph, Pattern } from "../memory/knowledge-graph";
import { BeliefLayer, BeliefType } from "../memory/belief-layer";

export interface ProductionRule {
  id: string;
  name: string;
  conditions: string[];
  actions: string[];
  confidence: number;
  successCount: number;
  failureCount: number;
  createdAt: number;
  lastUsed: number;
}

export interface ChunkingResult {
  newRules: ProductionRule[];
  strengthenedRules: ProductionRule[];
  newBeliefs: string[];
  newPatterns: Pattern[];
}

export class RuleLearningEngine {
  private rules: Map<string, ProductionRule> = new Map();
  private memory: MemoryStore;
  private knowledgeGraph: KnowledgeGraph;
  private beliefLayer: BeliefLayer;

  constructor(memory: MemoryStore, knowledgeGraph: KnowledgeGraph, beliefLayer: BeliefLayer) {
    this.memory = memory;
    this.knowledgeGraph = knowledgeGraph;
    this.beliefLayer = beliefLayer;
  }

  // === Chunking（SOAR 核心学习机制） ===
  async chunking(episode: EpisodicMemory, stateBefore: WorldState, stateAfter: WorldState): Promise<ChunkingResult> {
    console.log("🧠 [RuleLearning] Starting chunking process...");
    
    const result: ChunkingResult = {
      newRules: [],
      strengthenedRules: [],
      newBeliefs: [],
      newPatterns: []
    };

    // 1. 模式挖掘
    const patterns = this.minePatterns(stateBefore, stateAfter, episode);
    for (const pattern of patterns) {
      result.newPatterns.push(pattern);
    }

    // 2. 规则生成
    const newRules = this.generateProductionRules(patterns, episode);
    for (const rule of newRules) {
      result.newRules.push(rule);
    }

    // 3. 强化现有规则
    const strengthened = this.strengthenExistingRules(episode);
    result.strengthenedRules.push(...strengthened);

    // 4. 信念更新
    const beliefUpdates = this.updateBeliefsFromExperience(episode, stateBefore, stateAfter);
    result.newBeliefs.push(...beliefUpdates);

    console.log(`✅ [RuleLearning] Chunking complete: ${result.newRules.length} new rules, ${result.strengthenedRules.length} strengthened`);
    return result;
  }

  private minePatterns(
    stateBefore: WorldState,
    stateAfter: WorldState,
    episode: EpisodicMemory
  ): Pattern[] {
    const patterns: Pattern[] = [];

    // 寻找因果模式
    const changes = this.findStateChanges(stateBefore, stateAfter);
    
    for (const change of changes) {
      if (change.from !== change.to) {
        // 简单因果模式
        const conditions = this.extractRelevantConditions(stateBefore, change.entity);
        const pattern = this.knowledgeGraph.addPattern({
          type: "causal",
          conditions,
          outcome: `${change.entity}.${change.field}=${change.to}`,
          confidence: 0.6,
          frequency: 1
        });
        patterns.push(pattern);
      }
    }

    return patterns;
  }

  private findStateChanges(before: WorldState, after: WorldState): Array<{entity: string; field: string; from: any; to: any}> {
    const changes: Array<{entity: string; field: string; from: any; to: any}> = [];
    const allEntities = new Set([...Object.keys(before), ...Object.keys(after)]);

    for (const entity of allEntities) {
      const beforeEntity = before[entity] || {};
      const afterEntity = after[entity] || {};
      const allFields = new Set([...Object.keys(beforeEntity), ...Object.keys(afterEntity)]);

      for (const field of allFields) {
        if (beforeEntity[field] !== afterEntity[field]) {
          changes.push({
            entity,
            field,
            from: beforeEntity[field],
            to: afterEntity[field]
          });
        }
      }
    }

    return changes;
  }

  private extractRelevantConditions(state: WorldState, changeEntity: string): string[] {
    const conditions: string[] = [];
    
    // 简化提取：只提取变化实体本身的状态
    const entityState = state[changeEntity];
    if (entityState) {
      for (const [field, value] of Object.entries(entityState)) {
        conditions.push(`${changeEntity}.${field}=${value}`);
      }
    }

    return conditions.slice(0, 5); // 限制条件数量防止过拟合
  }

  private generateProductionRules(patterns: Pattern[], episode: EpisodicMemory): ProductionRule[] {
    const rules: ProductionRule[] = [];

    for (const pattern of patterns) {
      if (pattern.confidence > 0.55) {
        const ruleId = `rule:${Date.now()}:${Math.random().toString(36).substr(2, 6)}`;
        const rule: ProductionRule = {
          id: ruleId,
          name: `learned-rule-${patterns.indexOf(pattern) + 1}`,
          conditions: pattern.conditions,
          actions: [pattern.outcome],
          confidence: pattern.confidence,
          successCount: episode.outcome === "success" ? 1 : 0,
          failureCount: episode.outcome === "failure" ? 1 : 0,
          createdAt: Date.now(),
          lastUsed: Date.now()
        };

        this.rules.set(ruleId, rule);
        rules.push(rule);
        console.log(`📜 [RuleLearning] New production rule: ${rule.name} (${pattern.conditions.join(' & ')} → ${pattern.outcome})`);
      }
    }

    return rules;
  }

  private strengthenExistingRules(episode: EpisodicMemory): ProductionRule[] {
    const strengthened: ProductionRule[] = [];

    for (const [id, rule] of this.rules) {
      // 简化：如果是成功的 episode，强化所有相关规则
      if (episode.outcome === "success") {
        rule.successCount++;
        rule.confidence = Math.min(1, rule.confidence + 0.03);
        rule.lastUsed = Date.now();
        strengthened.push(rule);
      } else {
        rule.failureCount++;
        rule.confidence = Math.max(0, rule.confidence - 0.02);
      }
    }

    return strengthened;
  }

  private updateBeliefsFromExperience(
    episode: EpisodicMemory,
    stateBefore: WorldState,
    stateAfter: WorldState
  ): string[] {
    const newBeliefs: string[] = [];

    if (episode.event.includes("refund")) {
      if (episode.outcome === "failure") {
        const belief = this.beliefLayer.addBelief(
          "Refund service is experiencing temporary instability",
          0.75,
          "experience",
          BeliefType.HYPOTHESIS
        );
        newBeliefs.push(belief.id);
      }
    }

    return newBeliefs;
  }

  getRule(id: string): ProductionRule | undefined {
    return this.rules.get(id);
  }

  getBestRules(goal: GoalState): ProductionRule[] {
    return Array.from(this.rules.values())
      .filter(r => r.actions.some(a => a.includes(goal.entity) && a.includes(goal.field)))
      .sort((a, b) => b.confidence - a.confidence);
  }

  getRuleLearningSummary() {
    return {
      totalRules: this.rules.size,
      highConfidenceRules: Array.from(this.rules.values()).filter(r => r.confidence > 0.7).length,
      topRules: Array.from(this.rules.values())
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5)
        .map(r => ({
          name: r.name,
          confidence: r.confidence,
          successRate: r.successCount / (r.successCount + r.failureCount)
        }))
    };
  }
}
