
/**
 * 真实业务 Executor - Booking Service
 *
 * 不再是 Math.random()！
 * 接真实业务逻辑
 */

export interface Booking {
  id: string;
  status: "confirmed" | "cancelled" | "completed";
  customerId: string;
  listingId: string;
  checkinDate: string;
  amount: number;
  channel: string;
}

export class BookingExecutor {
  private bookings: Map<string, Booking> = new Map();

  constructor() {
    // 预置一些测试数据
    this.bookings.set("BKG-001", {
      id: "BKG-001",
      status: "confirmed",
      customerId: "CUST-001",
      listingId: "LST-001",
      checkinDate: "2026-07-01",
      amount: 15000,
      channel: "airbnb"
    });

    this.bookings.set("BKG-002", {
      id: "BKG-002",
      status: "confirmed",
      customerId: "CUST-002",
      listingId: "LST-002",
      checkinDate: "2026-07-15",
      amount: 20000,
      channel: "direct"
    });
  }

  /**
   * 取消订单
   */
  async cancel(bookingId: string): Promise<{
    success: boolean;
    booking?: Booking;
    error?: string;
  }> {
    console.log(`🏨 [Booking] Cancelling ${bookingId}...`);

    const booking = this.bookings.get(bookingId);
    if (!booking) {
      return {
        success: false,
        error: `Booking ${bookingId} not found`
      };
    }

    if (booking.status === "cancelled") {
      return {
        success: false,
        error: `Booking ${bookingId} already cancelled`
      };
    }

    // 真实业务逻辑
    booking.status = "cancelled";

    console.log(`✅ [Booking] ${bookingId} cancelled successfully`);

    return {
      success: true,
      booking: { ...booking }
    };
  }

  /**
   * 获取订单
   */
  getBooking(bookingId: string): Booking | undefined {
    const b = this.bookings.get(bookingId);
    return b ? { ...b } : undefined;
  }

  /**
   * 获取世界状态表示（用于 Episode Context）
   */
  getState(bookingId: string): any {
    const b = this.bookings.get(bookingId);
    if (!b) return {};

    // 丢弃 ID，保留业务属性！
    return {
      status: b.status,
      channel: b.channel,
      amount: b.amount
    };
  }
}
