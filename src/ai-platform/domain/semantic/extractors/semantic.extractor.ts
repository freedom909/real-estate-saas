import { inject, injectable } from "tsyringe";

import { ISemanticExtractor }
  from "../types/i-semantic.extractor";
import { SemanticContext } from "../semantic-context";
import {RuleExtractor} from "./rule.extractor";
import LLMExtractor from "./llm.extractor";
import { TOKENS_AMENITY } from "@/modules/tokens/amenity.tokens";
import { TOKENS_EXTRACTOR } from "@/ai-platform/container/tokens/semantic/extractor";
import { RuleUseCase } from "@/ai-platform/application/use-cases/rule.use-case";

@injectable()
export class SemanticExtractor implements ISemanticExtractor {

  constructor(
    @inject(TOKENS_EXTRACTOR.ruleExtractor)
    private ruleExtractor: RuleExtractor,

    @inject(TOKENS_EXTRACTOR.llmExtractor)
    private llmExtractor: LLMExtractor,
  ) {}

  async extract(message: string): Promise<SemanticContext> {

    // 1. RULE FIRST (hard override)
    const ruleResult = await this.ruleExtractor.extract(message);

    if (ruleResult.isRuleMatched) {
      return ruleResult; // ⭐直接返回
    }

    // 2. LLM fallback
    return await this.llmExtractor.extract(message);
    // 型 'LLMResult' には 型 'SemanticContext' からの次のプロパティがありません: rawInput, intents, entities, isRuleMatched、3 など。
  }
}