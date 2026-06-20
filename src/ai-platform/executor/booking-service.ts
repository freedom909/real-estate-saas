
/**
 * Booking Service - DEPENDS on WorldModel!
 *
 * No more Dual Source of Truth!
 */

import { WorldModel, Booking } from "../environment/world-model-v2";

export class BookingService {
  private worldModel: WorldModel;

  constructor(worldModel: WorldModel) {
    this.worldModel = worldModel;
  }

  /**
   * Cancel Booking - 真实业务逻辑
   */
  async cancel(bookingId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    console.log(`🏨 [BookingService] Cancelling ${bookingId}...`);

    const booking = this.worldModel.getBooking(bookingId);
    if (!booking) {
      return { success: false, error: `Booking ${bookingId} not found` };
    }

    if (booking.status === "cancelled") {
      return { success: false, error: `Booking ${bookingId} already cancelled` };
    }

    // 真实业务逻辑
    // 在真实系统里会调用数据库
    this.worldModel.updateBooking(bookingId, {
      status: "cancelled"
    });

    console.log(`✅ [BookingService] ${bookingId} cancelled!`);
    return { success: true };
  }
}
