export enum BeliefType {
  FACT = "fact",
  HYPOTHESIS = "hypothesis",
  ASSUMPTION = "assumption",
  HEURISTIC = "heuristic"
}

export interface Belief {
  id: string;
  type: BeliefType;
  proposition: string;
  confidence: number;
  source: string;
  createdAt: number;
  lastUpdated: number;
  supportingEvidence: string[];
  conflictingEvidence: string[];
}

export interface BeliefUpdate {
  beliefId: string;
  newConfidence: number;
  evidence?: string;
}

export class BeliefLayer {
  private beliefs: Map<string, Belief> = new Map();
  private beliefGraph: Map<string, Set<string>> = new Map(); // 信念之间的关系

  addBelief(
    proposition: string,
    confidence: number,
    source: string,
    type: BeliefType = BeliefType.HYPOTHESIS
  ): Belief {
    const id = `belief:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const belief: Belief = {
      id,
      type,
      proposition,
      confidence,
      source,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      supportingEvidence: [],
      conflictingEvidence: []
    };

    this.beliefs.set(id, belief);
    console.log(`💡 [BeliefLayer] New belief: "${proposition}" (confidence: ${(confidence * 100).toFixed(0)}%, source: ${source})`);
    return belief;
  }

  updateBelief(update: BeliefUpdate): Belief | null {
    const belief = this.beliefs.get(update.beliefId);
    if (!belief) return null;

    belief.confidence = update.newConfidence;
    belief.lastUpdated = Date.now();
    if (update.evidence) {
      if (update.newConfidence > belief.confidence) {
        belief.supportingEvidence.push(update.evidence);
      } else {
        belief.conflictingEvidence.push(update.evidence);
      }
    }

    console.log(`🔄 [BeliefLayer] Belief updated: "${belief.proposition}" → confidence: ${(belief.confidence * 100).toFixed(0)}%`);
    return belief;
  }

  getBelief(id: string): Belief | undefined {
    return this.beliefs.get(id);
  }

  getBeliefsByType(type: BeliefType): Belief[] {
    return Array.from(this.beliefs.values())
      .filter(b => b.type === type)
      .sort((a, b) => b.confidence - a.confidence);
  }

  getHighConfidenceBeliefs(threshold: number = 0.7): Belief[] {
    return Array.from(this.beliefs.values())
      .filter(b => b.confidence >= threshold)
      .sort((a, b) => b.confidence - a.confidence);
  }

  // === 认知一致性检查 ===
  checkConsistency(): { consistent: boolean; conflicts: Belief[][] } {
    const conflicts: Belief[][] = [];
    // 这里简化实现，实际上应该做更复杂的一致性检查
    return {
      consistent: conflicts.length === 0,
      conflicts
    };
  }

  getBeliefSummary() {
    const grouped: Record<BeliefType, number> = {
      [BeliefType.FACT]: 0,
      [BeliefType.HYPOTHESIS]: 0,
      [BeliefType.ASSUMPTION]: 0,
      [BeliefType.HEURISTIC]: 0
    };

    for (const belief of this.beliefs.values()) {
      grouped[belief.type]++;
    }

    return {
      total: this.beliefs.size,
      grouped,
      highConfidence: this.getHighConfidenceBeliefs().length,
      topBeliefs: Array.from(this.beliefs.values())
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5)
        .map(b => ({ proposition: b.proposition, confidence: b.confidence }))
    };
  }
}
