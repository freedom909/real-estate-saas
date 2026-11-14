
// src/wisdom/orchestration/normalizeIntent.stage.ts

import { injectable } from "tsyringe";

import { WisdomPipelineContext } from "../wisdomPipeline.context";
import { IPipelineStage } from "./i-pipeline-stage";

import { AgentAction } from "../../shared/enums/action.enum";
import { AIDomain } from "../../shared/enums/domain.enum";
import { SemanticContext } from "../../semantic/semantic-context";

import { BookingState } from "@/core/booking/domain/state/booking-state";
import { EntityType } from "../../shared/enums/entity-type.enum";

@injectable()
export class NormalizeIntentStage implements IPipelineStage {

  async execute(
    ctx: WisdomPipelineContext
  ): Promise<WisdomPipelineContext> {

    const semantic = ctx.resolvedSemantic;
    if (!semantic) return ctx;

    const raw = semantic.rawInput.toLowerCase();

    // --------------------------------------------------
    // 1. 检查本轮是否明确表达了预约意图
    // --------------------------------------------------

    const hasEnglishBookingIntent =
      /\b(book|reserve|confirm)\b/.test(raw) &&
      !/\b(cancel|delete)\b/.test(raw);

    const hasJapaneseBookingIntent =
      /予約|注文|ご注文|頼ん|とりたい|取りたい/.test(raw) &&
      !/キャンセル|取消/.test(raw);

    const hasBookingIntent =
      hasEnglishBookingIntent || hasJapaneseBookingIntent;

    // --------------------------------------------------
    // 2. 检查当前会话是否存在等待日期的预约草稿
    // --------------------------------------------------

    const bookingDraft = ctx.sessionMemory?.bookingDraft;

    const isWaitingForDates =
      bookingDraft?.status === BookingState.AWAITING_DATES &&
      !!bookingDraft.listingId;

    // --------------------------------------------------
    // 3. 检查本轮是否提供了日期信息
    // --------------------------------------------------

    const dateEntityTypes = new Set<string>([
      EntityType.CHECK_IN,
      EntityType.CHECK_OUT,
      EntityType.CHECK_IN_DATE,
      EntityType.CHECK_OUT_DATE,
      EntityType.DATE_RANGE,
      "check_in",
      "check_out",
      "checkIn",
      "checkOut",
      "check_in_date",
      "check_out_date",
    ]);

    const hasDateEntity = semantic.entities.some((entity: any) => {
      const type = String(
        entity.type ?? entity.entityType ?? ""
      );

      return dateEntityTypes.has(type);
    });

    // --------------------------------------------------
    // 4. 判断是否需要恢复预约意图
    // --------------------------------------------------

    const shouldContinueBooking =
      isWaitingForDates && hasDateEntity;

    const shouldNormalizeBooking =
      (hasBookingIntent &&
        !semantic.hasAction(AgentAction.CREATE_BOOKING)) ||
      shouldContinueBooking;

    if (shouldNormalizeBooking) {

      console.log("[NormalizeIntent] Booking intent restored:", {
        hasBookingIntent,
        shouldContinueBooking,
        isWaitingForDates,
        hasDateEntity,
        previousBookingStatus: bookingDraft?.status,
        listingId: bookingDraft?.listingId,
      });

      ctx.resolvedSemantic = new SemanticContext(
        semantic.rawInput,
        semantic.entities,
        {
          type: AgentAction.CREATE_BOOKING,
          confidence: shouldContinueBooking ? 0.9 : 0.7,
        },
        semantic.confidence,
        AIDomain.BOOKING,
        semantic.isRuleMatched
      );
    }

    return ctx;
  }
}
