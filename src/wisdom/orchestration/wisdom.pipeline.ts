// src/wisdom/orchestration/wisdom.pipeline.ts

// wisdom/pipeline/wisdom-pipeline.ts

import { inject, injectable, injectAll } from "tsyringe";
import { IPipelineStage } from "./stage/i-pipeline-stage";
import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";
import { WisdomPipelineContext } from "./wisdomPipeline.context";
import { SemanticStage } from "./stage/semantic.stage";
import { ReferenceStage } from "./stage/reference.stage";
import { NormalizeIntentStage } from "./stage/normalizeIntent.stage";
import { RoutingStage } from "./stage/routing.stage";
import { ExecutionStage } from "./stage/execution.stage";
import { KnowledgeStage } from "./stage/knowledge.stage";
import { SummaryStage } from "./stage/summary.stage";
import { ResponseStage } from "./stage/response.stage";
import { SemanticExtractor } from "../semantic/semantic-extractor";

@injectable()
export class WisdomPipeline {
    constructor(
        @inject(WISDOM_TOKENS.semanticStage)
        private readonly semanticStage: SemanticStage,

        @inject(WISDOM_TOKENS.referenceStage)
        private readonly referenceStage: ReferenceStage,

        @inject(WISDOM_TOKENS.normalizeIntentStage)
        private readonly normalizeIntentStage: NormalizeIntentStage,

        @inject(WISDOM_TOKENS.routingStage)
        private readonly routingStage: RoutingStage,

        @inject(WISDOM_TOKENS.executionStage)
        private readonly executionStage: ExecutionStage,

        @inject(WISDOM_TOKENS.knowledgeStage)
        private readonly knowledgeStage: KnowledgeStage,

        @inject(WISDOM_TOKENS.summaryStage)
        private readonly summaryStage: SummaryStage,

        @inject(WISDOM_TOKENS.responseStage)
        private readonly responseStage: ResponseStage,
    ) {}

    async run(ctx: WisdomPipelineContext) {
        ctx = await this.semanticStage.execute(ctx);
        ctx = await this.referenceStage.execute(ctx);
        ctx = await this.normalizeIntentStage.execute(ctx);
        ctx = await this.routingStage.execute(ctx);
        ctx = await this.executionStage.execute(ctx);
        ctx = await this.knowledgeStage.execute(ctx);
        ctx = await this.summaryStage.execute(ctx);
        ctx = await this.responseStage.execute(ctx);

        return ctx;
    }
}