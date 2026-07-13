// Rule 7: 退款规则 (Refund Rules)
// RefundRuleService — calculates refund amount based on timing and policy
import { RefundContext, RefundResult } from "../entity/value-objects/refund-context.vo";
import { RuleResult, rulePassed, ruleFailed } from "../entity/value-objects/rule-result.vo";

// Refund tiers based on proximity to check-in
const FULL_REFUND_HOURS = 48;       // >48h before check-in → 100% refund
const PARTIAL_REFUND_HOURS = 24;    // 24-48h before check-in → 50% refund
const PARTIAL_REFUND_RATE = 0.50;
const NO_REFUND_HOURS = 24;         // <24h before check-in → 0% refund

export class RefundRuleService {
  static readonly RULE_NAME = "REFUND_RULE";

  /**
   * Calculate the refund for a cancelled booking.
   * Business rule: refund amount cannot exceed amount already paid.
   */
  static calculate(ctx: RefundContext): RefundResult {
    // Must be cancelled to be eligible
    if (ctx.status !== "CANCELLED") {
      return {
        eligible: false,
        refundAmount: 0,
        reason: "Booking must be in CANCELLED status to receive a refund",
      };
    }

    // Cannot refund more than paid (core business rule)
    const maxRefund = ctx.amountPaid;
    if (maxRefund <= 0) {
      return {
        eligible: false,
        refundAmount: 0,
        reason: "No amount has been paid — nothing to refund",
      };
    }

    const hoursUntilCheckIn =
      (ctx.checkInDate.getTime() - ctx.cancelledAt.getTime()) / (1000 * 60 * 60);

    let refundRate: number;
    let reason: string;

    if (hoursUntilCheckIn >= FULL_REFUND_HOURS) {
      // More than 48h before check-in → full refund
      refundRate = 1.0;
      reason = `Full refund (${Math.round(hoursUntilCheckIn)}h before check-in)`;
    } else if (hoursUntilCheckIn >= PARTIAL_REFUND_HOURS) {
      // 24–48h before check-in → 50% refund
      refundRate = PARTIAL_REFUND_RATE;
      reason = `Partial refund: ${PARTIAL_REFUND_RATE * 100}% (${Math.round(hoursUntilCheckIn)}h before check-in)`;
    } else if (hoursUntilCheckIn >= 0) {
      // Less than 24h before check-in → no refund
      refundRate = 0;
      reason = `No refund: cancellation within ${NO_REFUND_HOURS}h of check-in (${Math.round(hoursUntilCheckIn)}h remaining)`;
    } else {
      // Already past check-in → no refund
      refundRate = 0;
      reason = "No refund: check-in date has already passed";
    }

    let refundAmount = Math.round(ctx.totalPrice * refundRate);

    // Core business rule: refund cannot exceed amount paid
    refundAmount = Math.min(refundAmount, maxRefund);

    // Ensure refund is never negative
    refundAmount = Math.max(0, refundAmount);

    return {
      eligible: refundAmount > 0,
      refundAmount,
      reason,
    };
  }
}
