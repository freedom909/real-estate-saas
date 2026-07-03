import { injectable, inject } from "tsyringe";
import { WisdomPipelineContext } from "./wisdomPipeline.context";
import { WisdomRequest } from "../contracts/request";
import { WisdomResponse } from "../contracts/response";
import { WisdomPipeline } from "./wisdom.pipeline";
import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";
import { AIDomain } from "../shared/enums/domain.enum";

@injectable()
export class WisdomOrchestrator {
  constructor(
    @inject(WISDOM_TOKENS.pipeline)
    private pipeline: WisdomPipeline
  ) {} 

  async handle(request: WisdomRequest): Promise<WisdomResponse> {
    console.log("handle request", request);
    const ctx: WisdomPipelineContext = {
      request,
      memoryContext: {
        userId: request.context.identity.user?.id ?? "anonymous",
        sessionId: request.context.runtime.sessionId ?? "default",
        session: {},
      },
      startTime: Date.now(),
    };

    console.log(
      JSON.stringify(request.context, null, 2)
    );

    const result = await this.pipeline.run(ctx);
    console.log("Pipeline finished");
console.log("Response:", result.response);
console.log("Artifacts:", result.response?.artifacts);
console.log({
    semantic: ctx.semantic,
    action: ctx.resolvedSemantic?.action,
    domain: ctx.resolvedSemantic?.domain,
    artifacts: ctx.response?.artifacts.length,
});

    // If pipeline didn't produce a response, return a fallback
    if (!result.response) {
      return {
        success: false,
        domain: AIDomain.GENERAL,
        primaryAction: { name: "unknown", confidence: 0 },
        summary: "Sorry, I couldn't process your request.",
        artifacts: [],
      };
    }

    return result.response;
  }
}
