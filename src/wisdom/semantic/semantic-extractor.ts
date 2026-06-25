// src/wisdom/semantic/semantic-extractor.ts

import { inject, injectable } from "tsyringe";
import { ISemanticExtractor } from "../contracts/semantic-extractor";
import { SemanticContext } from "./semantic-context";
import { RuleExtractor } from "./extractors/rule.extractor";
import { LLMExtractor } from "./extractors/llm.extractor";
import { MessageRuleExtractor } from "./extractors/message-rule.extractor";
import { WisdomRequest } from "../contracts/request";
import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";

@injectable()
export class SemanticExtractor implements ISemanticExtractor {
  constructor(
    @inject(WISDOM_TOKENS.extractors.ruleExtractor)
    private ruleExtractor: RuleExtractor,

    @inject(WISDOM_TOKENS.extractors.llmExtractor)
    private llmExtractor: LLMExtractor,

    @inject(WISDOM_TOKENS.extractors.messageRuleExtractor)
    private messageRuleExtractor: MessageRuleExtractor,
  ) {}

  async extract(request: WisdomRequest): Promise<SemanticContext> {
    // 1. Rule-based extraction (fastest, highest confidence)
    const ruleResult = await this.ruleExtractor.extract(request);
    if (ruleResult?.isRuleMatched) {
      return ruleResult;
    }

    // 2. Message pattern extraction (keyword matching)
    const messageRuleResult = this.messageRuleExtractor.extract(request.message);
    if (messageRuleResult) {
      return messageRuleResult;
    }

    // 3. LLM fallback (slowest, handles complex intent)
    return await this.llmExtractor.extract(request.message, request);
  }
}
