import { inject, injectable } from "tsyringe";

import { ISemanticExtractor }
  from "../types/i-semantic.extractor";
import { SemanticContext } from "../semantic-context";
import {RuleExtractor} from "./rule.extractor";
import LLMExtractor from "./llm.extractor";
import { TOKENS_AMENITY } from "@/modules/tokens/amenity.tokens";
import { TOKENS_EXTRACTOR } from "@/ai-platform/container/tokens/semantic/extractor";

@injectable()
export class SemanticExtractor  implements ISemanticExtractor {
 constructor(
  @inject(TOKENS_EXTRACTOR.ruleExtractor)
   private ruleExtractor: RuleExtractor,
   @inject(TOKENS_EXTRACTOR.llmExtractor)
   private llmExtractor: LLMExtractor
 ) {}
  public async extract(
    message: string
  ): Promise<SemanticContext> {

    // 1. rule first
    const ruleResult =
      await this.ruleExtractor.extract(
        message
      );

    if (
      ruleResult.intents.length && ruleResult.confidence > 0.8
    ) {
      return ruleResult;
    }

    // 2. fallback llm
    return await this.llmExtractor.extract(message);
  }
}