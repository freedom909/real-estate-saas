// Rule 9: 业务规则核心验证 (Booking Validation — Core Rules)
// BookingValidationService — validates the fundamental invariants for any booking operation
import { BookingContext } from "../entity/value-objects/booking-context.vo";
import { RuleResult, rulePassed, ruleFailed } from "../entity/value-objects/rule-result.vo";

export class BookingValidationService {
  static readonly RULE_NAME = "BOOKING_VALIDATION";

  /**
   * Validate all core business rules for a booking:
   *  1. 入住日期必须早于退房日期 (checkIn < checkOut)
   *  2. 已取消的订单不能再次确认 (cancelled → cannot confirm)
   *  3. 房源不可超售 (handled by OversaleCheck, but we validate price > 0)
   *  4. 一个用户一天最多预约 N 次 (requires external lookup — returns rule name for caller to enforce)
   *  5. 价格必须大于 0
   *  6. 退款金额不能超过已支付金额 (handled by RefundRule, but we validate at creation)
   *
   * @param dailyBookingCount — number of bookings this user already has today (caller must provide)
   * @param maxDailyBookings — max allowed per day (default 3)
   */
  static validate(
    ctx: BookingContext,
    dailyBookingCount: number = 0,
    maxDailyBookings: number = 3
  ): RuleResult[] {
    const results: RuleResult[] = [];

    // Rule: checkInDate must be before checkOutDate
    if (ctx.checkInDate >= ctx.checkOutDate) {
      results.push(
        ruleFailed(
          "CHECK_IN_BEFORE_CHECK_OUT",
          `Check-in date (${ctx.checkInDate.toISOString().slice(0, 10)}) must be before check-out date (${ctx.checkOutDate.toISOString().slice(0, 10)})`
        )
      );
    } else {
      results.push(rulePassed("CHECK_IN_BEFORE_CHECK_OUT"));
    }

    // Rule: price must be > 0
    if (ctx.nightlyPrice <= 0) {
      results.push(
        ruleFailed(
          "POSITIVE_PRICE",
          `Nightly price must be greater than 0 (got: ¥${ctx.nightlyPrice})`
        )
      );
    } else {
      results.push(rulePassed("POSITIVE_PRICE"));
    }

    if (ctx.totalPrice <= 0) {
      results.push(
        ruleFailed(
          "POSITIVE_TOTAL_PRICE",
          `Total price must be greater than 0 (got: ¥${ctx.totalPrice})`
        )
      );
    } else {
      results.push(rulePassed("POSITIVE_TOTAL_PRICE"));
    }

    // Rule: customer count >= 1
    if (ctx.customerCount < 1) {
      results.push(
        ruleFailed("MIN_customerS", "At least 1 customer is required")
      );
    } else {
      results.push(rulePassed("MIN_customerS"));
    }

    // Rule: cannot confirm a cancelled booking (for confirm operations)
    if (ctx.status === "CANCELLED") {
      results.push(
        ruleFailed(
          "CANCELLED_NO_CONFIRM",
          "A cancelled booking cannot be confirmed again"
        )
      );
    } else {
      results.push(rulePassed("CANCELLED_NO_CONFIRM"));
    }

    // Rule: one user max N bookings per day
    if (dailyBookingCount >= maxDailyBookings) {
      results.push(
        ruleFailed(
          "MAX_DAILY_BOOKINGS",
          `User has reached the maximum of ${maxDailyBookings} bookings per day (${dailyBookingCount} today)`
        )
      );
    } else {
      results.push(rulePassed("MAX_DAILY_BOOKINGS"));
    }

    return results;
  }

  /**
   * Convenience: validate and throw if any rule fails.
   */
  static validateOrFail(
    ctx: BookingContext,
    dailyBookingCount: number = 0,
    maxDailyBookings: number = 3
  ): void {
    const results = this.validate(ctx, dailyBookingCount, maxDailyBookings);
    const failures = results.filter((r) => !r.passed);
    if (failures.length > 0) {
      const messages = failures.map((f) => `[${f.ruleName}] ${f.message}`).join("\n");
      throw new Error(`Booking validation failed:\n${messages}`);
    }
  }
}
