// Rule 1: 取消政策（48 小时前免费）
// CancellationPolicyService — free cancellation if > 48h before check-in
import { BookingContext } from "../entity/value-objects/booking-context.vo";
import { RuleResult, rulePassed, ruleFailed } from "../entity/value-objects/rule-result.vo";

export class CancellationPolicyService {
  static readonly RULE_NAME = "CANCELLATION_POLICY";
  static readonly FREE_CANCELLATION_HOURS = 48;

  /**
   * Evaluate whether a booking can be freely cancelled.
   * - If checkInDate is more than 48h away → free cancellation
   * - If checkInDate is within 48h → not eligible for free cancellation
   * - If already checked in → cannot cancel
   */
  static evaluate(ctx: BookingContext, cancelledAt: Date = new Date()): RuleResult {
    const hoursUntilCheckIn =
      (ctx.checkInDate.getTime() - cancelledAt.getTime()) / (1000 * 60 * 60);

    // Already checked in
    if (hoursUntilCheckIn <= 0) {
      return ruleFailed(
        CancellationPolicyService.RULE_NAME,
        "Cannot cancel after check-in date has passed"
      );
    }

    // More than 48h before check-in → free cancellation
    if (hoursUntilCheckIn >= CancellationPolicyService.FREE_CANCELLATION_HOURS) {
      return rulePassed(
        CancellationPolicyService.RULE_NAME,
        `Free cancellation (${Math.round(hoursUntilCheckIn)}h before check-in)`
      );
    }

    // Within 48h → cancellation may incur fees (not free, but still allowed)
    return ruleFailed(
      CancellationPolicyService.RULE_NAME,
      `Cancellation within ${CancellationPolicyService.FREE_CANCELLATION_HOURS}h of check-in may incur charges (${Math.round(hoursUntilCheckIn)}h remaining)`
    );
  }
}
