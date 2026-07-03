// src/wisdom/orchestration/wisdomPipeline.context.ts

import { WisdomRequest } from "../contracts/request";
import { WisdomResponse } from "../contracts/response";
import { MemoryContext } from "../memory/type/memory-context";
import { SemanticContext } from "../semantic/semantic-context";

export interface WisdomPipelineContext {
  request: WisdomRequest;

  semantic?: SemanticContext;
  resolvedSemantic?: SemanticContext;

  agent?: any;
  rawResult?: any;

  response?: WisdomResponse;

  memoryContext: MemoryContext;

  knowledge?: any;

  startTime: number;
}