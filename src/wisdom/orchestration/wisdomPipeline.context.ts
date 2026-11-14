// src/wisdom/orchestration/wisdomPipeline.context.ts

import { WisdomRequest } from "../contracts/request";
import { WisdomResponse } from "../contracts/response";
import { MemoryContext } from "../memory/type/memory-context";
import { SessionMemory } from "../memory/type/sessionMemory";
import { SemanticContext } from "../semantic/semantic-context";

export interface WisdomPipelineContext {
request: WisdomRequest;
  semantic?: SemanticContext;
  resolvedSemantic?: SemanticContext;
  agent?: any;
  rawResult?: any;
  response?: WisdomResponse;
  memoryContext: MemoryContext;

  // 当前会话中已经保存的状态
  sessionMemory?: SessionMemory;

  knowledge?: any;
  startTime: number;
}