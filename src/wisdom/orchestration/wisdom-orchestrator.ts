
// src/wisdom/orchestration/wisdom-orchestrator.ts

import { injectable, inject } from "tsyringe";

import { WisdomPipelineContext } from "./wisdomPipeline.context";
import { WisdomRequest } from "../contracts/request";
import { WisdomResponse } from "../contracts/response";
import { WisdomPipeline } from "./wisdom.pipeline";

import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";
import { AIDomain } from "../shared/enums/domain.enum";

import { MemorySessionStore } from "../memory/session/session-memory.store";

@injectable()
export class WisdomOrchestrator {
  constructor(
    @inject(WISDOM_TOKENS.pipeline)
    private pipeline: WisdomPipeline,

    @inject(WISDOM_TOKENS.memory.sessionStore)
    private sessionStore: MemorySessionStore
  ) {}

  async handle(request: WisdomRequest): Promise<WisdomResponse> {
    console.log("handle request", request);

    const sessionId =
      request.context.runtime.sessionId ?? "default";

    // 每轮请求开始时，恢复之前保存的会话状态
    const sessionMemory = this.sessionStore.get(sessionId);

    console.log("[WisdomOrchestrator] Restored session:", {
      sessionId,
      hasSession: !!sessionMemory,
      bookingStatus: sessionMemory?.bookingDraft?.status,
      listingId: sessionMemory?.bookingDraft?.listingId,
      checkInDate: sessionMemory?.bookingDraft?.checkInDate,
      checkOutDate: sessionMemory?.bookingDraft?.checkOutDate,
    });

    const ctx: WisdomPipelineContext = {
      request,

      memoryContext: {
        userId: request.context.identity.user?.id ?? "anonymous",
        sessionId,
        session: {},
      },

      // 让后续 Pipeline Stage 可以读取上一轮的预约状态
      sessionMemory,

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

    if (!result.response) {
      return {
        success: false,
        domain: AIDomain.GENERAL,
        primaryAction: {
          name: "unknown",
          confidence: 0,
        },
        summary:
          "申し訳ありません。リクエストを処理できませんでした。もう一度お試しください。",
        artifacts: [],
      };
    }

    return result.response;
  }
}
