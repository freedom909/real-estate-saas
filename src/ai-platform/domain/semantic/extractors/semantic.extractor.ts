import { inject, injectable } from "tsyringe";

import { ISemanticExtractor }
  from "../types/i-semantic.extractor";
import { SemanticContext } from "../semantic-context";
import { RuleExtractor } from "./rule.extractor";
import LLMExtractor from "./llm.extractor";

import { TOKENS_EXTRACTOR } from "@/ai-platform/container/tokens/semantic/extractor";
import { AIRequest } from "../../types/context/aiContext";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import { SystemLogService } from "@/modules/audit/application/write/services/system-log.service";
import { SystemLogType } from "@/modules/audit/domain/enums/system-log.enums";

@injectable()
export class SemanticExtractor implements ISemanticExtractor {

  constructor(
    @inject(TOKENS_EXTRACTOR.ruleExtractor)
    private ruleExtractor: RuleExtractor,

    @inject(TOKENS_EXTRACTOR.llmExtractor)
    private llmExtractor: LLMExtractor,

    @inject(TOKENS_AUDIT.services.systemLogService)
    private logger: SystemLogService,
  ) { }

  async extract(request: AIRequest): Promise<SemanticContext> {
    // 1. RULE FIRST (hard override)
    const ruleResult = await this.ruleExtractor.extract(request);
    this.logger.debug(
      {
        ...ruleResult,
        message: request.message,
        type: "RULE" as SystemLogType,
        level: "DEBUG",
        service: "semantic-extractor",
      }       
    );


    if (ruleResult.isRuleMatched) {
      return ruleResult;
    }

    // 2. LLM fallback
    return await this.llmExtractor.extract(request.message);
  }
}