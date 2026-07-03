// src/wisdom/orchestration/pipeline-stage.ts

import { WisdomPipelineContext } from "../wisdomPipeline.context";

export interface IPipelineStage {
  execute(ctx: WisdomPipelineContext): Promise<WisdomPipelineContext>;
}