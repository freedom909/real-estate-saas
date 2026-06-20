import { GoalState } from "../state/world-state";

export interface Intent {
  naturalLanguage?: string;
  goalStates?: GoalState[];
  entities?: Record<string, any>;
}

export interface ParseResult {
  goalStates: GoalState[];
  description?: string;
  confidence: number;
  source: "rule" | "llm" | "explicit";
}

export interface Rule {
  id: string;
  match: (intent: Intent) => boolean;
  extract: (intent: Intent) => GoalState[];
  confidence: number;
}

export class GoalParser {
  private rules: Rule[] = [];
  private useLLM: boolean = false;
  private llmThreshold: number = 0.9;

  constructor() {
    this.registerDefaultRules();
  }

  registerRule(rule: Rule): void {
    this.rules.push(rule);
  }

  enableLLM(threshold: number = 0.9): void {
    this.useLLM = true;
    this.llmThreshold = threshold;
  }

  async parse(intent: Intent): Promise<ParseResult> {
    if (intent.goalStates && intent.goalStates.length > 0) {
      return {
        goalStates: intent.goalStates,
        description: intent.naturalLanguage,
        confidence: 1.0,
        source: "explicit"
      };
    }

    if (!intent.naturalLanguage) {
      return {
        goalStates: [],
        confidence: 0,
        source: "explicit"
      };
    }

    const ruleResult = this.tryRuleParse(intent);
    if (ruleResult.confidence >= this.llmThreshold) {
      return ruleResult;
    }

    if (this.useLLM) {
      return this.tryLLMParse(intent);
    }

    return ruleResult;
  }

  private tryRuleParse(intent: Intent): ParseResult {
    let bestMatch: ParseResult = {
      goalStates: [],
      confidence: 0,
      source: "rule"
    };

    for (const rule of this.rules) {
      if (rule.match(intent)) {
        const goalStates = rule.extract(intent);
        if (rule.confidence > bestMatch.confidence) {
          bestMatch = {
            goalStates,
            description: intent.naturalLanguage,
            confidence: rule.confidence,
            source: "rule"
          };
        }
      }
    }

    return bestMatch;
  }

  private async tryLLMParse(intent: Intent): Promise<ParseResult> {
    console.log("⚠️ LLM Parser placeholder - falling back to rule-based");
    return this.tryRuleParse(intent);
  }

  private registerDefaultRules(): void {
    this.registerRule({
      id: "cancel-refund",
      match: (intent) => {
        const lower = intent.naturalLanguage?.toLowerCase() || "";
        return lower.includes("cancel") && lower.includes("refund");
      },
      extract: () => [
        { entity: "booking", field: "status", value: "cancelled" },
        { entity: "refund", field: "created", value: true }
      ],
      confidence: 0.95
    });

    this.registerRule({
      id: "cancel-booking",
      match: (intent) => {
        const lower = intent.naturalLanguage?.toLowerCase() || "";
        return lower.includes("cancel") && (lower.includes("booking") || lower.includes("reservation"));
      },
      extract: () => [
        { entity: "booking", field: "status", value: "cancelled" }
      ],
      confidence: 0.9
    });

    this.registerRule({
      id: "refund-only",
      match: (intent) => {
        const lower = intent.naturalLanguage?.toLowerCase() || "";
        return lower.includes("refund");
      },
      extract: () => [
        { entity: "refund", field: "created", value: true }
      ],
      confidence: 0.85
    });

    this.registerRule({
      id: "cancel-refund-calendar",
      match: (intent) => {
        const lower = intent.naturalLanguage?.toLowerCase() || "";
        return lower.includes("cancel") && lower.includes("refund") && lower.includes("calendar");
      },
      extract: () => [
        { entity: "booking", field: "status", value: "cancelled" },
        { entity: "refund", field: "created", value: true },
        { entity: "calendar", field: "availability", value: true }
      ],
      confidence: 0.98
    });

    this.registerRule({
      id: "create-review",
      match: (intent) => {
        const lower = intent.naturalLanguage?.toLowerCase() || "";
        return lower.includes("review") || lower.includes("feedback");
      },
      extract: () => [
        { entity: "review", field: "created", value: true }
      ],
      confidence: 0.8
    });
  }
}
