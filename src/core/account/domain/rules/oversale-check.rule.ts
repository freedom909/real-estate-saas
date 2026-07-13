// Rule 4: 超售检查 (Oversale Check)
// OversaleCheckService — prevents double-booking of the same room
import { InventoryContext, InventoryCheckResult } from "../entity/value-objects/inventory-context.vo";
import { RuleResult, rulePassed, ruleFailed } from "../entity/value-objects/rule-result.vo";

export class OversaleCheckService {
  static readonly RULE_NAME = "OVERSALE_CHECK";

  /**
   * Check whether a booking would cause oversale.
   * The listing has numRooms rooms. We need to verify that
   * existing overlapping bookings + requested rooms <= total rooms.
   *
   * @param ctx — inventory context with totalRooms and existingBookings filled in
   */
  static evaluate(ctx: InventoryContext & { existingBookings: number; totalRooms: number }): InventoryCheckResult & RuleResult {
    const requestedRooms = ctx.numRooms || 1;
    const totalRooms = ctx.totalRooms;
    const existing = ctx.existingBookings;

    const wouldOversell = existing + requestedRooms > totalRooms;

    if (wouldOversell) {
      return {
        ...ruleFailed(
          OversaleCheckService.RULE_NAME,
          `Cannot book ${requestedRooms} room(s): only ${totalRooms - existing} of ${totalRooms} rooms available (${existing} already booked)`
        ),
        available: false,
        existingBookings: existing,
        totalRooms,
        requestedRooms,
        reason: `Only ${totalRooms - existing} room(s) available for the selected dates`,
      };
    }

    return {
      ...rulePassed(
        OversaleCheckService.RULE_NAME,
        `Rooms available: ${totalRooms - existing - requestedRooms} remaining after this booking`
      ),
      available: true,
      existingBookings: existing,
      totalRooms,
      requestedRooms,
      reason: "OK",
    };
  }
}
