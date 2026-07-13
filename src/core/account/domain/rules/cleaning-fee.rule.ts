// Rule 3: 清洁费规则
// CleaningFeeRuleService — calculates cleaning fee based on stay duration and customer count
import { PricingContext } from "../entity/value-objects/pricing-context.vo";
import { RuleResult, rulePassed, ruleFailed } from "../entity/value-objects/rule-result.vo";

// Base cleaning fee tiers (configurable per listing, these are defaults)
const CLEANING_FEE_BASE = 3000;           // ¥3,000 base
const CLEANING_FEE_PER_customer = 500;       // ¥500 per extra customer above 2
const CLEANING_FEE_LONG_STAY_DISCOUNT = 0.20; // 20% discount for stays > 7 nights
const LONG_STAY_THRESHOLD_NIGHTS = 7;

export class CleaningFeeRuleService {
  static readonly RULE_NAME = "CLEANING_FEE";

  /**
   * Calculate the cleaning fee for a booking.
   * Rules:
   *  - Base fee for any stay
   *  - Additional fee per customer above 2
   *  - 20% discount for stays longer than 7 nights
   *  - Must be > 0 (rule: price must be > 0)
   */
  static calculate(ctx: PricingContext): RuleResult & { cleaningFee: number } {
    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.ceil(
      (ctx.checkOutDate.getTime() - ctx.checkInDate.getTime()) / msPerDay
    );

    if (nights <= 0) {
      return {
        ...ruleFailed(CleaningFeeRuleService.RULE_NAME, "Invalid stay duration for cleaning fee calculation"),
        cleaningFee: 0,
      };
    }

    // Base fee
    let fee = CLEANING_FEE_BASE;

    // Extra customers (> 2 customers)
    const extracustomers = Math.max(0, ctx.customerCount - 2);
    fee += extracustomers * CLEANING_FEE_PER_customer;

    // Long-stay discount
    if (nights > LONG_STAY_THRESHOLD_NIGHTS) {
      fee = Math.round(fee * (1 - CLEANING_FEE_LONG_STAY_DISCOUNT));
    }

    // Business rule: cleaning fee must be > 0
    if (fee <= 0) {
      return {
        ...ruleFailed(CleaningFeeRuleService.RULE_NAME, "Cleaning fee must be greater than 0"),
        cleaningFee: fee,
      };
    }

    return {
      ...rulePassed(
        CleaningFeeRuleService.RULE_NAME,
        `Cleaning fee: ¥${fee} (${nights} nights, ${ctx.customerCount} customers${extracustomers > 0 ? `, +${extracustomers} extra` : ""}${nights > LONG_STAY_THRESHOLD_NIGHTS ? `, long-stay discount applied` : ""})`
      ),
      cleaningFee: fee,
    };
  }
}
