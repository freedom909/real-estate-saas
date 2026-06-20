export enum MetaCognitionAction {
  ASK_HUMAN = "ask_human",
  INCREASE_CAUTION = "increase_caution",
  DELEGATE = "delegate",
  RETHINK = "rethink",
  ESCALATE = "escalate"
}

export interface MetaCognitionDecision {
  action: MetaCognitionAction | null;
  reasoning: string;
  confidenceThreshold: number;
  metaConfidence: number;
  humanRequired: boolean;
  questionsForHuman?: string[];
}

export interface ReasoningTrace {
  id: string;
  timestamp: number;
  reasoningSteps: string[];
  decisions: string[];
  confidenceHistory: number[];
}

export class MetaCognitionLayer {
  private confidences: number[] = [];
  private traces: ReasoningTrace[] = [];
  private cautionLevel: number = 0; // 0 = normal, 1 = increased, 2 = high
  private askHumanThreshold: number = 0.5;

  // === 元认知决策 ===
  analyzeReasoning(
    reasoningConfidence: number,
    context: any = {}
  ): MetaCognitionDecision {
    this.confidences.push(reasoningConfidence);

    console.log(`🤔 [MetaCognition] Analyzing reasoning (confidence: ${(reasoningConfidence * 100).toFixed(0)}%)`);

    if (reasoningConfidence < this.askHumanThreshold) {
      return {
        action: MetaCognitionAction.ASK_HUMAN,
        reasoning: "Reasoning confidence below threshold. Human input required.",
        confidenceThreshold: this.askHumanThreshold,
        metaConfidence: 0.95,
        humanRequired: true,
        questionsForHuman: [
          "Please verify the current reasoning path.",
          "Any additional constraints or preferences?"
        ]
      };
    }

    const recentConfidences = this.confidences.slice(-5);
    const avgConfidence = recentConfidences.reduce((a, b) => a + b, 0) / recentConfidences.length;
    
    if (avgConfidence < 0.65 && recentConfidences.length >= 3) {
      this.increaseCaution();
      return {
        action: MetaCognitionAction.INCREASE_CAUTION,
        reasoning: `Recent reasoning confidence is declining (avg: ${(avgConfidence * 100).toFixed(0)}%). Increasing caution.`,
        confidenceThreshold: this.askHumanThreshold,
        metaConfidence: 0.85,
        humanRequired: false
      };
    }

    return {
      action: null,
      reasoning: "Reasoning confidence is sufficient. Proceeding.",
      confidenceThreshold: this.askHumanThreshold,
      metaConfidence: 0.9,
      humanRequired: false
    };
  }

  increaseCaution(): void {
    if (this.cautionLevel < 2) {
      this.cautionLevel++;
      this.askHumanThreshold = Math.max(0.3, this.askHumanThreshold - 0.1);
      console.log(`⚠️ [MetaCognition] Caution level increased to ${this.cautionLevel}. Ask threshold now ${(this.askHumanThreshold * 100).toFixed(0)}%`);
    }
  }

  decreaseCaution(): void {
    if (this.cautionLevel > 0) {
      this.cautionLevel--;
      this.askHumanThreshold = Math.min(0.7, this.askHumanThreshold + 0.1);
    }
  }

  recordTrace(trace: Omit<ReasoningTrace, "id" | "timestamp">): void {
    this.traces.push({
      ...trace,
      id: `trace:${Date.now()}`,
      timestamp: Date.now()
    });
  }

  getCautionLevel(): number {
    return this.cautionLevel;
  }

  getMetaCognitionSummary() {
    return {
      cautionLevel: this.cautionLevel,
      askHumanThreshold: this.askHumanThreshold,
      recentConfidenceTrend: this.confidences.slice(-10),
      traces: this.traces.length
    };
  }
}
