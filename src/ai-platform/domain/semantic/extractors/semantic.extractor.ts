// src/ai-platform/domain/semantic/extractors/semantic.extractor.ts

import { inject, injectable } from "tsyringe";

import { ISemanticExtractor }
  from "../types/i-semantic.extractor";
import { SemanticContext } from "../semantic-context";
import { RuleExtractor } from "./rule.extractor";
import LLMExtractor from "./llm.extractor";

import { TOKENS_EXTRACTOR } from "@/ai-platform/container/tokens/semantic/extractor";

import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import { SystemLogService } from "@/modules/audit/application/write/services/system-log.service";
import { SystemLogLevel, SystemLogType } from "@/modules/audit/domain/enums/system-log.enums";
import { AIRequest } from "@/ai-platform/context/types/context/aiContext";

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

    this.logger.debug({
      level: "DEBUG",
      type:"SYSTEM",
      
      service: "AIPlatform",
      module: "SemanticExtractor",
      message: `Extracting semantic context for message: ${request.message.substring(0, 50)}...`,
      correlationId: request.context.trace?.correlationId,
      data: { isRuleMatched: ruleResult.isRuleMatched }
    });

    if (ruleResult.isRuleMatched) {
      return ruleResult;
    }

    // 2. LLM fallback
    return await this.llmExtractor.extract(request.message);
  }
}