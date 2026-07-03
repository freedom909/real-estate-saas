// src/wisdom/orchestration/wisdom-pipeline.context.ts

// src/wisdom/orchestration/wisdom-pipeline.context.ts

import { WisdomRequest } from "../contracts/request";
import { WisdomResponse } from "../contracts/response";
import { SemanticContext } from "../semantic/semantic-context";
import { MemoryContext } from "../memory/type/memory-context";
import { IDomainAgent } from "../contracts/agent";
import { ISemanticExtractor } from "../contracts/semantic-extractor";

export class WisdomPipelineContext {
  constructor(
    public readonly request: WisdomRequest,
    public readonly memoryContext: MemoryContext,
    public readonly startTime: number = Date.now(),
    private readonly extractor: ISemanticExtractor
  ) {}

  semantic?: SemanticContext;

  resolvedSemantic?: SemanticContext;

  agent?: IDomainAgent;

  rawResult?: any;

  response?: WisdomResponse;

  knowledge?: any;

  metadata: Record<string, any> = {};

  async execute(ctx: WisdomPipelineContext) {
    ctx.semantic = await this.extractor.extract(ctx.request);
    return ctx;
}
}