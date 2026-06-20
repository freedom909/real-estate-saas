
import { WorldState, GoalState } from "../state/world-state";
import { CognitiveGraph, ConceptNode } from "../memory/cognitive-graph";
import { TruthMaintenanceSystem } from "../memory/truth-maintenance-system";
import { ACTRWorkingMemory } from "../memory/actr-working-memory";
import { Belief, BeliefType } from "../memory/belief-layer";

export enum ReasoningType {
  DEDUCTION = "deduction",
  ABDUCTION = "abduction",
  INDUCTION = "induction",
  ANALOGY = "analogy",
  CAUSAL = "causal",
  COUNTERFACTUAL = "counterfactual"
}

export interface ReasoningStep {
  id: string;
  type: ReasoningType;
  premises: string[];
  conclusion: string;
  confidence: number;
  timestamp: number;
}

export interface CausalAnalysis {
  cause: string;
  effect: string;
  evidence: string[];
  strength: number;
}

export class CognitiveReasoningEngine {
  private cognitiveGraph: CognitiveGraph;
  private tms: TruthMaintenanceSystem;
  private workingMemory: ACTRWorkingMemory;
  private reasoningTrace: ReasoningStep[] = [];

  constructor(cognitiveGraph: CognitiveGraph, tms: TruthMaintenanceSystem, workingMemory: ACTRWorkingMemory) {
    this.cognitiveGraph = cognitiveGraph;
    this.tms = tms;
    this.workingMemory = workingMemory;
  }

  // 核心推理方法
  async reason(observation: any, context: WorldState): Promise<ReasoningStep[]> {
    console.log("🧠 [Cognitive Reasoning] Starting reasoning process");

    const steps: ReasoningStep[] = [];

    // 1. 演绎推理（Deduction）
    const deductionSteps = this.deduce(context);
    steps.push(...deductionSteps);

    // 2. 溯因推理（Abduction）- 寻找解释
    const abductionSteps = this.abduce(observation, context);
    steps.push(...abductionSteps);

    // 3. 归纳推理（Induction）
    const inductionSteps = this.induce(steps, context);
    steps.push(...inductionSteps);

    // 4. 因果推理（Causal Reasoning）
    const causalSteps = this.causalReasoning(observation, context);
    steps.push(...causalSteps);

    this.reasoningTrace.push(...steps);
    return steps;
  }

  // 演绎推理：从一般原理到具体结论
  private deduce(context: WorldState): ReasoningStep[] {
    console.log("🔍 [Cognitive Reasoning] Performing deduction");

    const steps: ReasoningStep[] = [];

    // 从认知图谱中获取所有概念
    const allConcepts = this.cognitiveGraph.query<ConceptNode>({ type: "ConceptNode" as any });

    for (const concept of allConcepts) {
      // 使用认知图谱的演绎推理
      const deductions = this.cognitiveGraph.deduce(concept);

      for (const conclusion of deductions) {
        const step: ReasoningStep = {
          id: `deduction:${Date.now()}:${Math.random().toString(36).substr(2, 6)}`,
          type: ReasoningType.DEDUCTION,
          premises: [concept.name],
          conclusion: conclusion.name,
          confidence: 0.85,
          timestamp: Date.now()
        };
        steps.push(step);
        console.log(`    Deduction: ${concept.name} → ${conclusion.name}`);
      }
    }

    return steps;
  }

  // 溯因推理：从观察到最佳解释
  private abduce(observation: any, context: WorldState): ReasoningStep[] {
    console.log("🔍 [Cognitive Reasoning] Performing abduction (seeking explanations)");

    const steps: ReasoningStep[] = [];

    // 创建观察的概念节点
    let observationConcept = this.cognitiveGraph.getConcept(observation.name || "Observation");
    if (!observationConcept) {
      observationConcept = this.cognitiveGraph.addConcept(observation.name || "Observation", 0.95);
    }

    // 寻找可能的解释
    const explanations = this.cognitiveGraph.abduct(observationConcept);

    for (const explanation of explanations) {
      const step: ReasoningStep = {
        id: `abduction:${Date.now()}:${Math.random().toString(36).substr(2, 6)}`,
        type: ReasoningType.ABDUCTION,
        premises: [observationConcept.name],
        conclusion: explanation.name,
        confidence: 0.7,
        timestamp: Date.now()
      };
      steps.push(step);
      console.log(`    Abduction: ${observationConcept.name} is explained by ${explanation.name}`);
    }

    return steps;
  }

  // 归纳推理：从具体观察到一般规律
  private induce(steps: ReasoningStep[], context: WorldState): ReasoningStep[] {
    console.log("🔍 [Cognitive Reasoning] Performing induction");

    const newSteps: ReasoningStep[] = [];

    // 简单归纳：寻找重复模式
    const patterns = this.findPatterns(steps);

    for (const pattern of patterns) {
      const step: ReasoningStep = {
        id: `induction:${Date.now()}:${Math.random().toString(36).substr(2, 6)}`,
        type: ReasoningType.INDUCTION,
        premises: pattern.instances,
        conclusion: pattern.generalization,
        confidence: pattern.confidence,
        timestamp: Date.now()
      };
      newSteps.push(step);
      console.log(`    Induction: Pattern ${pattern.generalization} observed ${pattern.instances.length} times`);
    }

    return newSteps;
  }

  // 因果推理
  private causalReasoning(observation: any, context: WorldState): ReasoningStep[] {
    console.log("🔍 [Cognitive Reasoning] Performing causal reasoning");

    const steps: ReasoningStep[] = [];

    // 分析可能的因果关系
    const causalAnalyses = this.analyzeCausality(observation, context);

    for (const analysis of causalAnalyses) {
      const step: ReasoningStep = {
        id: `causal:${Date.now()}:${Math.random().toString(36).substr(2, 6)}`,
        type: ReasoningType.CAUSAL,
        premises: analysis.evidence,
        conclusion: `${analysis.cause} → ${analysis.effect}`,
        confidence: analysis.strength,
        timestamp: Date.now()
      };
      steps.push(step);
      console.log(`    Causal: ${analysis.cause} causes ${analysis.effect} (strength: ${analysis.strength})`);
    }

    return steps;
  }

  private findPatterns(steps: ReasoningStep[]): Array<{
    generalization: string;
    instances: string[];
    confidence: number;
  }> {
    const patterns: Array<{ generalization: string; instances: string[]; confidence: number }> = [];
    const patternMap = new Map<string, string[]>();

    for (const step of steps) {
      const key = step.type;
      if (!patternMap.has(key)) {
        patternMap.set(key, []);
      }
      patternMap.get(key)!.push(step.conclusion);
    }

    for (const [pattern, instances] of patternMap) {
      if (instances.length >= 3) { // 至少3个实例才归纳
        patterns.push({
          generalization: pattern,
          instances,
          confidence: Math.min(0.9, instances.length * 0.25)
        });
      }
    }

    return patterns;
  }

  private analyzeCausality(observation: any, context: WorldState): CausalAnalysis[] {
    const analyses: CausalAnalysis[] = [];

    // 简化的因果分析
    // 实际系统中会更复杂，涉及时间序列、相关性等
    if (observation.error) {
      analyses.push({
        cause: "Service Error",
        effect: "Operation Failed",
        evidence: [observation.error.message],
        strength: 0.85
      });
    }

    if (context.booking?.status && !observation.success) {
      analyses.push({
        cause: "Booking Status",
        effect: "Cannot Perform Operation",
        evidence: [`Current status: ${context.booking.status}`],
        strength: 0.75
      });
    }

    return analyses;
  }

  // 反驳推理
  counterfactualReasoning(scenario: string, context: WorldState): string[] {
    console.log("🔍 [Cognitive Reasoning] Performing counterfactual reasoning");
    return [`What if: ${scenario}`];
  }

  getReasoningTrace(): ReasoningStep[] {
    return [...this.reasoningTrace];
  }

  getReasoningSummary(): {
    totalSteps: number;
    byType: Record<ReasoningType, number>;
    latestSteps: ReasoningStep[];
  } {
    const byType: Record<ReasoningType, number> = {
      [ReasoningType.DEDUCTION]: 0,
      [ReasoningType.ABDUCTION]: 0,
      [ReasoningType.INDUCTION]: 0,
      [ReasoningType.ANALOGY]: 0,
      [ReasoningType.CAUSAL]: 0,
      [ReasoningType.COUNTERFACTUAL]: 0
    };

    for (const step of this.reasoningTrace) {
      byType[step.type]++;
    }

    return {
      totalSteps: this.reasoningTrace.length,
      byType,
      latestSteps: this.reasoningTrace.slice(-10)
    };
  }
}
