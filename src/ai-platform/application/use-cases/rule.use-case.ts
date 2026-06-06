// rule.use-case.ts

import { TOKENS_EXTRACTOR } from "@/ai-platform/container/tokens/semantic/extractor";
import { RuleExtractor } from "@/ai-platform/domain/semantic/extractors/rule.extractor";
import { inject } from "tsyringe";

export class RuleUseCase {
  constructor(
    @inject(TOKENS_EXTRACTOR.ruleExtractor)
    private ruleExtractor: RuleExtractor,
  ) {}
  async execute(message: string) {
    return await this.ruleExtractor.extract(message);
  }
}