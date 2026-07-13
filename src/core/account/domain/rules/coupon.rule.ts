// Rule 6: 优惠券规则 (Coupon Rules)
// CouponRuleService — validates coupon and applies discount
import { CouponContext, CouponValidationResult } from "../entity/value-objects/coupon-context.vo";
import { RuleResult, rulePassed, ruleFailed } from "../entity/value-objects/rule-result.vo";

// Coupon store (in production, this would come from DB)
// For domain rules, we define the validation logic, not the data source
export interface CouponRecord {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number;
  validFrom: Date;
  validUntil: Date;
  listingIds?: string[];  // If empty, applies to all listings
  usageLimit?: number;
  usedCount?: number;
  active: boolean;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export class CouponRuleService {
  static readonly RULE_NAME = "COUPON_RULE";

  /**
   * Validate a coupon code against its rules and compute discount.
   * Pure function — caller provides the coupon record (fetched from DB elsewhere).
   */
  static validate(
    ctx: CouponContext,
    couponRecord: CouponRecord | null
  ): CouponValidationResult {
    // No coupon provided
    if (!ctx.couponCode || ctx.couponCode.trim() === "") {
      return {
        valid: false,
        discountType: "fixed",
        discountValue: 0,
        finalPrice: ctx.totalPrice,
        reason: "No coupon code provided",
      };
    }

    // Coupon not found
    if (!couponRecord) {
      return {
        valid: false,
        discountType: "fixed",
        discountValue: 0,
        finalPrice: ctx.totalPrice,
        reason: `Coupon "${ctx.couponCode}" not found`,
      };
    }

    // Active check
    if (!couponRecord.active) {
      return {
        valid: false,
        discountType: couponRecord.discountType,
        discountValue: 0,
        finalPrice: ctx.totalPrice,
        reason: `Coupon "${ctx.couponCode}" is no longer active`,
      };
    }

    // Date validity
    const now = new Date();
    if (now < couponRecord.validFrom || now > couponRecord.validUntil) {
      return {
        valid: false,
        discountType: couponRecord.discountType,
        discountValue: 0,
        finalPrice: ctx.totalPrice,
        reason: `Coupon "${ctx.couponCode}" is not valid for this date range`,
      };
    }

    // Minimum order amount
    if (ctx.totalPrice < couponRecord.minOrderAmount) {
      return {
        valid: false,
        discountType: couponRecord.discountType,
        discountValue: 0,
        finalPrice: ctx.totalPrice,
        reason: `Minimum order amount ¥${couponRecord.minOrderAmount} not met (current: ¥${ctx.totalPrice})`,
      };
    }

    // Listing restriction
    if (
      couponRecord.listingIds &&
      couponRecord.listingIds.length > 0 &&
      !couponRecord.listingIds.includes(ctx.listingId)
    ) {
      return {
        valid: false,
        discountType: couponRecord.discountType,
        discountValue: 0,
        finalPrice: ctx.totalPrice,
        reason: `Coupon "${ctx.couponCode}" is not valid for this listing`,
      };
    }

    // Usage limit
    if (couponRecord.usageLimit !== undefined && couponRecord.usedCount !== undefined) {
      if (couponRecord.usedCount >= couponRecord.usageLimit) {
        return {
          valid: false,
          discountType: couponRecord.discountType,
          discountValue: 0,
          finalPrice: ctx.totalPrice,
          reason: `Coupon "${ctx.couponCode}" has reached its usage limit`,
        };
      }
    }

    // Calculate discount
    let discount = 0;
    if (couponRecord.discountType === "percentage") {
      discount = Math.round(ctx.totalPrice * (couponRecord.discountValue / 100));
    } else {
      discount = couponRecord.discountValue;
    }

    // Cap at maxDiscount
    discount = Math.min(discount, couponRecord.maxDiscount);

    // Price must be > 0 (core business rule)
    const finalPrice = Math.max(0, ctx.totalPrice - discount);

    return {
      valid: true,
      discountType: couponRecord.discountType,
      discountValue: discount,
      finalPrice,
      reason: `Coupon applied: -¥${discount} (${couponRecord.discountType === "percentage" ? `${couponRecord.discountValue}%` : `¥${couponRecord.discountValue}`})`,
    };
  }
}
