// src/wisdom/orchestration/routing.stage.ts


import { AgentRouter } from "../../agents/agent-router";
import { WisdomPipelineContext } from "../wisdomPipeline.context";
import { IPipelineStage } from "./i-pipeline-stage";

import { injectable, inject } from "tsyringe";
import { WISDOM_TOKENS } from "@/wisdom/container/tokens/wisdom.tokens";

@injectable()
export class RoutingStage {
    constructor(
        @inject(WISDOM_TOKENS.router)
        private readonly router: AgentRouter
    ) {}

    async execute(ctx: WisdomPipelineContext) {
        ctx.agent = this.router.route(ctx.resolvedSemantic!);
        return ctx;
    }
}