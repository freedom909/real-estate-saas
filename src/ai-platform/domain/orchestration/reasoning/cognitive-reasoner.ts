import { WorldState, GoalState } from "../state/world-state";
import { ParseResult } from "../planner/goal.parser";
import { MemoryStore } from "../memory/memory-store";
import { KnowledgeBase, ConceptKnowledge } from "../memory/knowledge-base";

export interface ReasoningContext {
  currentState: WorldState;
  goalState?: ParseResult;
  observations: any[];
  history: any[];
  plan?: any;
  currentStep?: any;
}

export interface ReasoningDecision {
  shouldContinue: boolean;
  shouldReplan: boolean;
  shouldUpdateGoal: boolean;
  updatedGoals?: GoalState[];
  reasoning: string;
  confidence: number;
  suggestedAction?: string;
  failureAnalysis?: {
    rootCause?: string;
    possibleFixes?: string[];
    reasoning?: string;
  };
}

export class CognitiveReasoner {
  private memory: MemoryStore;
  private knowledgeBase: KnowledgeBase;

  constructor(memory: MemoryStore, knowledgeBase: KnowledgeBase) {
    this.memory = memory;
    this.knowledgeBase = knowledgeBase;
  }

  async reason(context: ReasoningContext): Promise<ReasoningDecision> {
    console.log("🧠 [CognitiveReasoner] Reasoning...");
    console.log("📚 [CognitiveReasoner] Retrieving from Knowledge Base...");

    // 先做知识归纳（从 Experience → Knowledge）
    await this.knowledgeBase.induceKnowledge();

    // 1. 检查目标是否已达成
    if (context.goalState && this.areGoalsSatisfied(context.goalState.goalStates, context.currentState)) {
      console.log("✅ [CognitiveReasoner] All goals satisfied!");
      return {
        shouldContinue: false,
        shouldReplan: false,
        shouldUpdateGoal: false,
        reasoning: "All goals achieved. Task complete.",
        confidence: 1.0
      };
    }

    // 2. 基于 Knowledge Base 的智能推理
    const knowledgeDrivenDecision = this.reasonFromKnowledge(context);
    if (knowledgeDrivenDecision) {
      return knowledgeDrivenDecision;
    }

    // 3. 默认继续执行
    return {
      shouldContinue: true,
      shouldReplan: false,
      shouldUpdateGoal: false,
      reasoning: "No critical issues detected. Continuing with current plan.",
      confidence: 0.7
    };
  }

  private areGoalsSatisfied(goals: GoalState[], state: WorldState): boolean {
    return goals.every(goal => {
      const currentValue = state[goal.entity]?.[goal.field];
      return currentValue === goal.value;
    });
  }

  // === 基于 Knowledge Base 的推理 ===
  private reasonFromKnowledge(context: ReasoningContext): ReasoningDecision | null {
    const reasoning: string[] = [];
    let shouldReplan = false;
    let shouldUpdateGoal = false;
    let confidence = 0.8;

    // 1. 检查服务健康知识
    if (context.currentStep?.capabilityId) {
      const serviceName = context.currentStep.capabilityId.split('.')[0];
      const serviceHealth = this.knowledgeBase.getServiceHealth(serviceName);
      
      if (serviceHealth) {
        const health = serviceHealth.facts;
        if (health.status === "unstable" && health.reliability < 0.4) {
          reasoning.push(`⚠️ Service '${serviceName}' is highly unstable (reliability: ${Math.round(health.reliability * 100)}%)`);
          shouldReplan = true;
          confidence = 0.9;
        } else if (health.status === "degraded") {
          reasoning.push(`⚠️ Service '${serviceName}' is degraded (reliability: ${Math.round(health.reliability * 100)}%)`);
          confidence = 0.75;
        }
      }
    }

    // 2. 检查最近失败模式
    const recentFailures = this.memory.getRecentFailures("refund", 3);
    if (recentFailures.length >= 3) {
      reasoning.push(`📋 Detected pattern: ${recentFailures.length} consecutive refund failures`);
      
      // 智能推理目标进化
      if (context.goalState?.goalStates.some(g => g.field === "created" && g.entity === "refund")) {
        shouldUpdateGoal = true;
        reasoning.push("🤔 Suggesting goal evolution: Maybe partial refund or alternative approach is better");
        confidence = 0.85;
      }
    }

    // 3. 检查技能成功率
    if (context.currentStep?.capabilityId) {
      const skillKnowledge = this.knowledgeBase.getSkillKnowledge(context.currentStep.capabilityId);
      if (skillKnowledge && skillKnowledge.successRate < 0.5) {
        reasoning.push(`📉 Skill '${skillKnowledge.skillId}' has low success rate: ${Math.round(skillKnowledge.successRate * 100)}%`);
        shouldReplan = true;
        confidence = 0.88;
      }
    }

    if (reasoning.length > 0) {
      return {
        shouldContinue: true,
        shouldReplan,
        shouldUpdateGoal,
        reasoning: reasoning.join(". "),
        confidence,
        failureAnalysis: shouldReplan ? {
          rootCause: "Knowledge-based detection of potential issues",
          reasoning: reasoning.join(". ")
        } : undefined
      };
    }

    return null;
  }
}
