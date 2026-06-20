import { Intent, ParseResult } from "../planner/goal.parser";
import { GoalState } from "../state/world-state";

export interface ExtractionRule {
  id: string;
  match: (text: string, context?: any) => boolean;
  extract: (text: string, context?: any) => GoalState[];
  priority: number;
  confidence: number;
}

export interface SemanticContext {
  domain?: string;
  entities?: Record<string, any>;
  history?: any[];
  userPreferences?: any;
}

export abstract class BaseExtractor {
  abstract extract(intent: Intent, context?: SemanticContext): Promise<ParseResult>;
  abstract getConfidence(): number;
}

export class RuleBasedExtractor extends BaseExtractor {
  private rules: ExtractionRule[] = [];

  registerRule(rule: ExtractionRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  async extract(intent: Intent, context?: SemanticContext): Promise<ParseResult> {
    if (!intent.naturalLanguage) {
      return {
        goalStates: intent.goalStates || [],
        confidence: 1.0,
        source: "explicit"
      };
    }

    const text = intent.naturalLanguage.toLowerCase();

    for (const rule of this.rules) {
      if (rule.match(text, context)) {
        const goals = rule.extract(text, context);
        return {
          goalStates: goals,
          description: intent.naturalLanguage,
          confidence: rule.confidence,
          source: "rule"
        };
      }
    }

    return {
      goalStates: [],
      confidence: 0,
      source: "rule"
    };
  }

  getConfidence(): number {
    return 0.9;
  }
}

export class LLMExtractor extends BaseExtractor {
  private fallbackEnabled = true;

  async extract(intent: Intent, context?: SemanticContext): Promise<ParseResult> {
    console.log("🤖 LLM Extractor (placeholder)");
    console.log("📝 Input:", intent.naturalLanguage);

    const fallbackExtractor = new RuleBasedExtractor();
    this.registerDefaultRules(fallbackExtractor);
    
    return await fallbackExtractor.extract(intent, context);
  }

  getConfidence(): number {
    return 0.95;
  }

  private registerDefaultRules(extractor: RuleBasedExtractor): void {
    extractor.registerRule({
      id: "cancel-refund",
      match: (text) => text.includes("cancel") && text.includes("refund"),
      extract: () => [
        { entity: "booking", field: "status", value: "cancelled" },
        { entity: "refund", field: "created", value: true }
      ],
      priority: 100,
      confidence: 0.95
    });

    extractor.registerRule({
      id: "cancel",
      match: (text) => text.includes("cancel"),
      extract: () => [
        { entity: "booking", field: "status", value: "cancelled" }
      ],
      priority: 90,
      confidence: 0.9
    });

    extractor.registerRule({
      id: "refund",
      match: (text) => text.includes("refund"),
      extract: () => [
        { entity: "refund", field: "created", value: true }
      ],
      priority: 80,
      confidence: 0.85
    });

    extractor.registerRule({
      id: "review",
      match: (text) => text.includes("review") || text.includes("feedback"),
      extract: () => [
        { entity: "review", field: "created", value: true }
      ],
      priority: 70,
      confidence: 0.8
    });
  }
}

export class SemanticLayer {
  private ruleExtractor: RuleBasedExtractor;
  private llmExtractor: LLMExtractor;
  private llmThreshold: number = 0.9;

  constructor() {
    this.ruleExtractor = new RuleBasedExtractor();
    this.llmExtractor = new LLMExtractor();
    this.registerDefaultRules();
  }

  registerRule(rule: ExtractionRule): void {
    this.ruleExtractor.registerRule(rule);
  }

  setLLMThreshold(threshold: number): void {
    this.llmThreshold = threshold;
  }

  async extract(intent: Intent, context?: SemanticContext): Promise<ParseResult> {
    console.log("🔮 Semantic Layer Extracting...");

    if (intent.goalStates && intent.goalStates.length > 0) {
      console.log("📋 Explicit goal states provided");
      return {
        goalStates: intent.goalStates,
        confidence: 1.0,
        source: "explicit",
        description: intent.naturalLanguage
      };
    }

    const ruleResult = await this.ruleExtractor.extract(intent, context);
    console.log("📝 Rule extractor result:", ruleResult);

    if (ruleResult.confidence >= this.llmThreshold && ruleResult.goalStates.length > 0) {
      console.log("✅ Rule extractor confidence sufficient");
      return ruleResult;
    }

    console.log("🤖 Falling back to LLM extractor");
    const llmResult = await this.llmExtractor.extract(intent, context);
    return llmResult;
  }

  private registerDefaultRules(): void {
    this.ruleExtractor.registerRule({
      id: "cancel-refund",
      match: (text) => text.includes("cancel") && text.includes("refund"),
      extract: () => [
        { entity: "booking", field: "status", value: "cancelled" },
        { entity: "refund", field: "created", value: true }
      ],
      priority: 100,
      confidence: 0.95
    });

    this.ruleExtractor.registerRule({
      id: "cancel",
      match: (text) => text.includes("cancel"),
      extract: () => [
        { entity: "booking", field: "status", value: "cancelled" }
      ],
      priority: 90,
      confidence: 0.9
    });
  }
}
