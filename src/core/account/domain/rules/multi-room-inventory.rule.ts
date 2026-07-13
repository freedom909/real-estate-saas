// Rule 5: 多房间库存 (Multi-Room Inventory)
// MultiRoomInventoryService — validates multi-room booking against listing capacity
import { InventoryContext, InventoryCheckResult } from "../entity/value-objects/inventory-context.vo";
import { RuleResult, rulePassed, ruleFailed } from "../entity/value-objects/rule-result.vo";

const MAX_ROOMS_PER_BOOKING = 5;

export class MultiRoomInventoryService {
  static readonly RULE_NAME = "MULTI_ROOM_INVENTORY";

  /**
   * Validate that a multi-room request is within bounds:
   *  - numRooms must be >= 1
   *  - numRooms must not exceed listing's total rooms
   *  - numRooms must not exceed MAX_ROOMS_PER_BOOKING
   *  - Combined with oversale check, total overlapping bookings + requested <= totalRooms
   */
  static evaluate(
    ctx: InventoryContext & { totalRooms: number; existingBookings: number }
  ): InventoryCheckResult & RuleResult {
    const requested = ctx.numRooms || 1;
    const totalRooms = ctx.totalRooms;
    const existing = ctx.existingBookings;

    // numRooms >= 1
    if (requested < 1) {
      return {
        ...ruleFailed(MultiRoomInventoryService.RULE_NAME, "At least 1 room must be booked"),
        available: false,
        existingBookings: existing,
        totalRooms,
        requestedRooms: requested,
        reason: "numRooms must be >= 1",
      };
    }

    // numRooms <= MAX_ROOMS_PER_BOOKING
    if (requested > MAX_ROOMS_PER_BOOKING) {
      return {
        ...ruleFailed(
          MultiRoomInventoryService.RULE_NAME,
          `Cannot book more than ${MAX_ROOMS_PER_BOOKING} rooms in a single booking (requested: ${requested})`
        ),
        available: false,
        existingBookings: existing,
        totalRooms,
        requestedRooms: requested,
        reason: `Max ${MAX_ROOMS_PER_BOOKING} rooms per booking`,
      };
    }

    // numRooms <= listing's total rooms
    if (requested > totalRooms) {
      return {
        ...ruleFailed(
          MultiRoomInventoryService.RULE_NAME,
          `Requested ${requested} rooms but listing only has ${totalRooms} total`
        ),
        available: false,
        existingBookings: existing,
        totalRooms,
        requestedRooms: requested,
        reason: `Listing has only ${totalRooms} rooms`,
      };
    }

    // Combined oversale: existing + requested <= totalRooms
    if (existing + requested > totalRooms) {
      return {
        ...ruleFailed(
          MultiRoomInventoryService.RULE_NAME,
          `Only ${totalRooms - existing} of ${totalRooms} rooms available (${requested} requested)`
        ),
        available: false,
        existingBookings: existing,
        totalRooms,
        requestedRooms: requested,
        reason: `Insufficient rooms: ${totalRooms - existing} available, ${requested} requested`,
      };
    }

    return {
      ...rulePassed(MultiRoomInventoryService.RULE_NAME, `${requested} room(s) available`),
      available: true,
      existingBookings: existing,
      totalRooms,
      requestedRooms: requested,
      reason: "OK",
    };
  }
}
