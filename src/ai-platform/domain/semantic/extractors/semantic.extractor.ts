// src/ai-platform/domain/semantic/extractors/semantic.extractor.ts

import { inject, injectable } from "tsyringe";

import { ISemanticExtractor }
  from "../types/i-semantic.extractor";
import { SemanticContext } from "../semantic-context";
import { RuleExtractor } from "./rule.extractor";
import LLMExtractor from "./listing/llm.extractor";
import {MessageRuleExtractor} from "./message-rule.extractor";

import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import { SystemLogService } from "@/modules/audit/application/write/services/system-log.service";
import { SystemLogLevel, SystemLogType } from "@/modules/audit/domain/enums/system-log.enums";
import { AIRequest } from "@/ai-platform/context/types/context/ai.context";
import { TOKENS_EXTRACTOR } from "@/ai-platform/container/semantic/extractor";

@injectable()
export class SemanticExtractor implements ISemanticExtractor {

  constructor(
    @inject(TOKENS_EXTRACTOR.ruleExtractor)
    private ruleExtractor: RuleExtractor,

    @inject(TOKENS_EXTRACTOR.llmExtractor)
    private llmExtractor: LLMExtractor,


    @inject(TOKENS_EXTRACTOR.messageRuleExtractor)
    private messageRuleExtractor: MessageRuleExtractor,

    @inject(TOKENS_AUDIT.services.systemLogService)
    private logger: SystemLogService,
  ) { }

async extract(
  request: AIRequest
): Promise<SemanticContext> {

  // Episode Rule
  const ruleResult =
    await this.ruleExtractor.extract(
      request
    );

  if (ruleResult?.isRuleMatched) {

    console.log(
      "✅ EPISODE RULE MATCHED"
    );
  console.log(
    "EPISODE RESULT >>>",
    JSON.stringify(ruleResult, null, 2)
  );
    return ruleResult
  }

  // Message Rule
  const messageRuleResult =
    this.messageRuleExtractor.extract(
      request.message
    );

  if (messageRuleResult) {

    console.log(
      "✅ MESSAGE RULE MATCHED",
      messageRuleResult.action.type
    );

    return messageRuleResult;
  }

  // LLM Fallback
  return await this.llmExtractor.extract(
    request.message
  );
}
}