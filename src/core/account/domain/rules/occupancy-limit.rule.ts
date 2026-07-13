// Rule 8: 入住人数限制 (Occupancy Limit)
// OccupancyLimitService — ensures customer count doesn't exceed listing capacity
import { OccupancyContext } from "../entity/value-objects/inventory-context.vo";
import { RuleResult, rulePassed, ruleFailed } from "../entity/value-objects/rule-result.vo";

export class OccupancyLimitService {
  static readonly RULE_NAME = "OCCUPANCY_LIMIT";

  /**
   * Validate that the customer count doesn't exceed the listing's max occupancy.
   */
  static evaluate(ctx: OccupancyContext): RuleResult {
    if (ctx.customerCount < 1) {
      return ruleFailed(
        OccupancyLimitService.RULE_NAME,
        "At least 1 customer is required"
      );
    }

    if (ctx.maxOccupancy <= 0) {
      return ruleFailed(
        OccupancyLimitService.RULE_NAME,
        "Listing occupancy limit is not configured"
      );
    }

    if (ctx.customerCount > ctx.maxOccupancy) {
      return ruleFailed(
        OccupancyLimitService.RULE_NAME,
        `customer count (${ctx.customerCount}) exceeds listing capacity (${ctx.maxOccupancy} max customers)`
      );
    }

    return rulePassed(
      OccupancyLimitService.RULE_NAME,
      `${ctx.customerCount} customer(s) within capacity (${ctx.maxOccupancy} max)`
    );
  }
}
