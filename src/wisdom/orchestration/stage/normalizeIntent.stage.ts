// src/wisdom/orchestration/normalizeIntent.stage.ts

import { injectable } from "tsyringe";
import { WisdomPipelineContext } from "../wisdomPipeline.context";
import { IPipelineStage } from "./i-pipeline-stage";
import { AgentAction } from "../../shared/enums/action.enum";
import { SemanticContext } from "../../semantic/semantic-context";


@injectable()
export class NormalizeIntentStage implements IPipelineStage {
  async execute(ctx: WisdomPipelineContext): Promise<WisdomPipelineContext> {
    const semantic = ctx.resolvedSemantic;
    if (!semantic) return ctx;

    const raw = semantic.rawInput.toLowerCase();

    // English booking intent
    const hasEnglishBookingIntent =
      /\b(book|reserve|confirm)\b/.test(raw) &&
      !/\b(cancel|delete)\b/.test(raw);

    // Japanese booking intent (予約 = reservation/booking)
    const hasJapaneseBookingIntent =
      /予約|予約する|予約します|予約したい|ご予約/.test(raw) &&
      !/キャンセル|取消/.test(raw);

    const hasBookingIntent = hasEnglishBookingIntent || hasJapaneseBookingIntent;

    if (
      hasBookingIntent &&
      !semantic.hasAction(AgentAction.CREATE_BOOKING)
    ) {
      ctx.resolvedSemantic = new SemanticContext(
        semantic.rawInput,
        semantic.entities,
        {
          type: AgentAction.CREATE_BOOKING,
          confidence: 0.7,
        },
        semantic.confidence,
        semantic.domain,
        semantic.isRuleMatched
      );
    }

    return ctx;
  }
}
