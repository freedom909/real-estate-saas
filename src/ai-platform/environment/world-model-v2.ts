
/**
 * WorldModel v2 - Single Source of Truth!
 *
 * No more Dual Source!
 * BookingExecutor and PaymentExecutor DEPEND on WorldModel!
 */

export interface Booking {
  id: string;
  status: "confirmed" | "cancelled" | "completed";
  customerId: string;
  listingId: string;
  checkinDate: string;
  amount: number;
  channel: string;
  hoursBeforeCheckin: number;
}

export interface Payment {
  id: string;
  bookingId: string;
  method: "credit_card" | "paypay" | "paypal" | "bank_transfer";
  status: "paid" | "refunded" | "failed";
  amount: number;
}

export interface WorldState {
  booking?: Booking;
  payment?: Payment;
}

export class WorldModel {
  private state: WorldState = {};
  private history: Array<{ timestamp: number; state: WorldState }> = [];

  // 单一真实源 - 所有状态都存在这里
  private bookings: Map<string, Booking> = new Map();
  private payments: Map<string, Payment> = new Map();

  constructor() {}

  // ===== Booking Methods (Single Source!) =====
  getBooking(id: string): Booking | undefined {
    return this.bookings.get(id);
  }

  updateBooking(id: string, updates: Partial<Booking>): Booking | undefined {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const updated = { ...booking, ...updates };
    this.bookings.set(id, updated);

    this.updateState();
    return updated;
  }

  setBooking(booking: Booking): void {
    this.bookings.set(booking.id, booking);
    this.updateState();
  }

  // ===== Payment Methods (Single Source!) =====
  getPayment(id: string): Payment | undefined {
    return this.payments.get(id);
  }

  updatePayment(id: string, updates: Partial<Payment>): Payment | undefined {
    const payment = this.payments.get(id);
    if (!payment) return undefined;

    const updated = { ...payment, ...updates };
    this.payments.set(id, updated);

    this.updateState();
    return updated;
  }

  setPayment(payment: Payment): void {
    this.payments.set(payment.id, payment);
    this.updateState();
  }

  private updateState(): void {
    this.state = {
      booking: this.bookings.size > 0 ? Array.from(this.bookings.values())[0] : undefined,
      payment: this.payments.size > 0 ? Array.from(this.payments.values())[0] : undefined
    };

    this.history.push({
      timestamp: Date.now(),
      state: { ...this.state }
    });
  }

  getState(): WorldState {
    return { ...this.state };
  }

  getStateAsFeatures(): Record<string, any> {
    const features: Record<string, any> = {};

    if (this.state.booking) {
      features["booking.status"] = this.state.booking.status;
      features["booking.channel"] = this.state.booking.channel;
      features["booking.amount"] = this.state.booking.amount;
      features["booking.hoursBeforeCheckin"] = this.state.booking.hoursBeforeCheckin;
    }

    if (this.state.payment) {
      features["payment.method"] = this.state.payment.method;
      features["payment.status"] = this.state.payment.status;
      features["payment.amount"] = this.state.payment.amount;
    }

    return features;
  }

  reset(): void {
    this.bookings.clear();
    this.payments.clear();
    this.state = {};
    this.history = [];
  }
}
