
import { Belief, BeliefType } from "./belief-layer";

export enum JustificationType {
  OBSERVATION = "observation",
  DEDUCTION = "deduction",
  INDUCTION = "induction",
  ABDUCTION = "abduction",
  ANALOGY = "analogy",
  TESTIMONY = "testimony"
}

export interface Justification {
  id: string;
  type: JustificationType;
  premises: string[];
  conclusion: string;
  strength: number;
  timestamp: number;
  source: string;
}

export enum TruthValue {
  TRUE = "true",
  FALSE = "false",
  UNKNOWN = "unknown",
  CONFLICTED = "conflicted",
  RETRACTED = "retracted"
}

export interface TruthMaintenanceBelief {
  belief: Belief;
  truthValue: TruthValue;
  justifications: Justification[];
  contradictions: string[];
  dependsOn: string[];
  supports: string[];
  baseLevel: number;
  activation: number;
  lastRetrieved: number;
  retrievalCount: number;
}

export class TruthMaintenanceSystem {
  private beliefs: Map<string, TruthMaintenanceBelief> = new Map();
  private justificationGraph: Map<string, Set<string>> = new Map(); // premise -> conclusions
  private contradictionGraph: Map<string, Set<string>> = new Map(); // belief -> contradictions

  addBelief(belief: Belief, justification?: Justification): TruthMaintenanceBelief {
    const tmsBelief: TruthMaintenanceBelief = {
      belief,
      truthValue: TruthValue.UNKNOWN,
      justifications: [],
      contradictions: [],
      dependsOn: [],
      supports: [],
      baseLevel: 0,
      activation: 0,
      lastRetrieved: Date.now(),
      retrievalCount: 0
    };

    if (justification) {
      tmsBelief.justifications.push(justification);
      tmsBelief.dependsOn = [...justification.premises];
      
      // 更新依赖图
      for (const premiseId of justification.premises) {
        if (!this.justificationGraph.has(premiseId)) {
          this.justificationGraph.set(premiseId, new Set());
        }
        this.justificationGraph.get(premiseId)!.add(belief.id);
        
        const premiseBelief = this.beliefs.get(premiseId);
        if (premiseBelief) {
          premiseBelief.supports.push(belief.id);
        }
      }
    }

    this.beliefs.set(belief.id, tmsBelief);
    console.log(`📊 [TMS] Added belief: ${belief.proposition} (${belief.type})`);
    return tmsBelief;
  }

  justifyBelief(beliefId: string, justification: Justification): void {
    const tmsBelief = this.beliefs.get(beliefId);
    if (!tmsBelief) {
      console.warn(`⚠️ [TMS] Belief not found: ${beliefId}`);
      return;
    }

    tmsBelief.justifications.push(justification);
    tmsBelief.dependsOn = Array.from(new Set([...tmsBelief.dependsOn, ...justification.premises]));

    // 更新依赖图
    for (const premiseId of justification.premises) {
      if (!this.justificationGraph.has(premiseId)) {
        this.justificationGraph.set(premiseId, new Set());
      }
      this.justificationGraph.get(premiseId)!.add(beliefId);
      
      const premiseBelief = this.beliefs.get(premiseId);
      if (premiseBelief) {
        premiseBelief.supports.push(beliefId);
      }
    }

    this.updateTruthValue(beliefId);
    console.log(`🔍 [TMS] Justified belief: ${beliefId} with ${justification.type}`);
  }

  addContradiction(beliefId1: string, beliefId2: string): void {
    if (!this.contradictionGraph.has(beliefId1)) {
      this.contradictionGraph.set(beliefId1, new Set());
    }
    if (!this.contradictionGraph.has(beliefId2)) {
      this.contradictionGraph.set(beliefId2, new Set());
    }

    this.contradictionGraph.get(beliefId1)!.add(beliefId2);
    this.contradictionGraph.get(beliefId2)!.add(beliefId1);

    const b1 = this.beliefs.get(beliefId1);
    const b2 = this.beliefs.get(beliefId2);

    if (b1) b1.contradictions.push(beliefId2);
    if (b2) b2.contradictions.push(beliefId1);

    console.log(`⚠️ [TMS] Contradiction detected: ${beliefId1} <-> ${beliefId2}`);
    this.resolveContradictions();
  }

  updateTruthValue(beliefId: string): void {
    const tmsBelief = this.beliefs.get(beliefId);
    if (!tmsBelief) return;

    // 检查是否有矛盾
    if (tmsBelief.contradictions.length > 0) {
      tmsBelief.truthValue = TruthValue.CONFLICTED;
      return;
    }

    if (tmsBelief.justifications.length === 0) {
      // 没有正当理由，保持 UNKNOWN
      return;
    }

    // 计算综合信心
    const totalStrength = tmsBelief.justifications.reduce((sum, j) => sum + j.strength, 0);
    const avgStrength = totalStrength / tmsBelief.justifications.length;

    // 更新 Truth Value
    if (avgStrength > 0.7) {
      tmsBelief.truthValue = TruthValue.TRUE;
    } else if (avgStrength < 0.3) {
      tmsBelief.truthValue = TruthValue.FALSE;
    } else {
      tmsBelief.truthValue = TruthValue.UNKNOWN;
    }

    // 检查是否有新的矛盾
    this.checkContradictions();
  }

  private checkContradictions(): void {
    for (const [beliefId, tmsBelief] of this.beliefs) {
      const contradictions = this.contradictionGraph.get(beliefId);
      if (!contradictions) continue;

      for (const contradictionId of contradictions) {
        const contradictionBelief = this.beliefs.get(contradictionId);
        if (!contradictionBelief) continue;

        if (tmsBelief.truthValue === TruthValue.TRUE && 
            contradictionBelief.truthValue === TruthValue.TRUE) {
          // 两个都为真，矛盾！
          this.resolveContradiction(beliefId, contradictionId);
        }
      }
    }
  }

  private resolveContradictions(): void {
    // 解决所有矛盾的简单策略：优先保留证据更强的信念
    for (const [beliefId, contradictions] of this.contradictionGraph) {
      for (const contradictionId of contradictions) {
        this.resolveContradiction(beliefId, contradictionId);
      }
    }
  }

  private resolveContradiction(beliefId1: string, beliefId2: string): void {
    const tmsBelief1 = this.beliefs.get(beliefId1);
    const tmsBelief2 = this.beliefs.get(beliefId2);

    if (!tmsBelief1 || !tmsBelief2) return;

    console.log(`🔄 [TMS] Resolving contradiction: ${beliefId1} vs ${beliefId2}`);

    // 比较证据强度
    const strength1 = this.getJustificationStrength(tmsBelief1);
    const strength2 = this.getJustificationStrength(tmsBelief2);

    if (strength1 > strength2) {
      this.retractBelief(beliefId2);
    } else {
      this.retractBelief(beliefId1);
    }
  }

  private getJustificationStrength(tmsBelief: TruthMaintenanceBelief): number {
    if (tmsBelief.justifications.length === 0) return 0;
    return tmsBelief.justifications.reduce((sum, j) => sum + j.strength, 0) / tmsBelief.justifications.length;
  }

  retractBelief(beliefId: string): void {
    const tmsBelief = this.beliefs.get(beliefId);
    if (!tmsBelief) return;

    tmsBelief.truthValue = TruthValue.RETRACTED;
    console.log(`⬇️ [TMS] Retracted belief: ${tmsBelief.belief.proposition}`);

    // 撤回依赖于此信念的所有信念
    const supportedBeliefs = this.justificationGraph.get(beliefId) || new Set();
    for (const supportedId of supportedBeliefs) {
      const supportedBelief = this.beliefs.get(supportedId);
      if (supportedBelief && supportedBelief.truthValue !== TruthValue.RETRACTED) {
        // 检查是否还有其他正当理由
        const stillJustified = supportedBelief.dependsOn.some(premiseId => {
          const premise = this.beliefs.get(premiseId);
          return premise && premise.truthValue === TruthValue.TRUE && premiseId !== beliefId;
        });

        if (!stillJustified) {
          this.retractBelief(supportedId);
        }
      }
    }
  }

  updateBeliefWithEvidence(beliefId: string, evidenceStrength: number, evidenceType: JustificationType): void {
    const tmsBelief = this.beliefs.get(beliefId);
    if (!tmsBelief) return;

    // 证据是观察到的，添加新的正当理由
    const justification: Justification = {
      id: `justification:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`,
      type: evidenceType,
      premises: [],
      conclusion: beliefId,
      strength: evidenceStrength,
      timestamp: Date.now(),
      source: "evidence"
    };

    tmsBelief.justifications.push(justification);
    this.updateTruthValue(beliefId);

    // 更新信心（类似 ACT-R 的方式）
    this.updateBaseLevel(tmsBelief);
  }

  private updateBaseLevel(tmsBelief: TruthMaintenanceBelief): void {
    const now = Date.now();
    const timeSinceLast = now - tmsBelief.lastRetrieved;
    const decayRate = 0.5; // ACT-R 衰减率

    // ACT-R 的基本激活方程：B_i = ln(Σ t_j^-d)
    tmsBelief.baseLevel = tmsBelief.baseLevel + Math.log(Math.pow(timeSinceLast / 1000, -decayRate));
    tmsBelief.activation = tmsBelief.baseLevel; // 简化
    tmsBelief.lastRetrieved = now;
    tmsBelief.retrievalCount++;
  }

  retrieveBeliefsByActivation(minActivation: number = 0): TruthMaintenanceBelief[] {
    const now = Date.now();
    const decayRate = 0.5;

    const beliefsWithActivation = Array.from(this.beliefs.values())
      .filter(b => b.truthValue !== TruthValue.RETRACTED)
      .map(belief => {
        // 计算衰减后的激活
        const timeSinceLast = now - belief.lastRetrieved;
        const activation = belief.baseLevel * Math.exp(-decayRate * timeSinceLast / 1000);
        return { belief, activation };
      })
      .filter(({ activation }) => activation >= minActivation)
      .sort((a, b) => b.activation - a.activation)
      .map(({ belief }) => belief);

    return beliefsWithActivation;
  }

  getBelief(beliefId: string): TruthMaintenanceBelief | undefined {
    const tmsBelief = this.beliefs.get(beliefId);
    if (tmsBelief) {
      this.updateBaseLevel(tmsBelief);
    }
    return tmsBelief;
  }

  getTMSState(): {
    totalBeliefs: number;
    trueBeliefs: number;
    falseBeliefs: number;
    conflictedBeliefs: number;
    retractedBeliefs: number;
    topBeliefs: { proposition: string; confidence: number; truthValue: TruthValue }[];
  } {
    const beliefValues: Record<TruthValue, number> = {
      [TruthValue.TRUE]: 0,
      [TruthValue.FALSE]: 0,
      [TruthValue.UNKNOWN]: 0,
      [TruthValue.CONFLICTED]: 0,
      [TruthValue.RETRACTED]: 0
    };

    for (const tmsBelief of this.beliefs.values()) {
      beliefValues[tmsBelief.truthValue]++;
    }

    const topBeliefs = Array.from(this.beliefs.values())
      .filter(b => b.truthValue === TruthValue.TRUE)
      .sort((a, b) => b.belief.confidence - a.belief.confidence)
      .slice(0, 5)
      .map(b => ({
        proposition: b.belief.proposition,
        confidence: b.belief.confidence,
        truthValue: b.truthValue
      }));

    return {
      totalBeliefs: this.beliefs.size,
      trueBeliefs: beliefValues[TruthValue.TRUE],
      falseBeliefs: beliefValues[TruthValue.FALSE],
      conflictedBeliefs: beliefValues[TruthValue.CONFLICTED],
      retractedBeliefs: beliefValues[TruthValue.RETRACTED],
      topBeliefs
    };
  }
}
