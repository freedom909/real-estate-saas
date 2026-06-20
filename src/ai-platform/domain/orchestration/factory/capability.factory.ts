import { BookingCapability } from "@/ai-platform/application/capabilities/booking/booking.capability";

interface ExecutorClass {
  new (...args: any[]): any;
}

export class CapabilityFactory {
  private executors: Map<string, ExecutorClass> = new Map();

  constructor() {
    this.registerDefaultExecutors();
  }

  private registerDefaultExecutors() {
    this.register("booking.create", class {
      constructor(private bookingCapability: BookingCapability = new BookingCapability()) {}
      async execute(input: any) {
        return this.bookingCapability.createBooking(input);
      }
    });

    this.register("booking.cancel", class {
      constructor(private bookingCapability: BookingCapability = new BookingCapability()) {}
      async execute(bookingId: string, reason: string) {
        return this.bookingCapability.cancelBooking(bookingId, reason);
      }
    });

    this.register("booking.confirm", class {
      constructor(private bookingCapability: BookingCapability = new BookingCapability()) {}
      async execute(bookingId: string) {
        return this.bookingCapability.confirmBooking(bookingId);
      }
    });

    this.register("booking.complete", class {
      constructor(private bookingCapability: BookingCapability = new BookingCapability()) {}
      async execute(bookingId: string) {
        return this.bookingCapability.completeBooking(bookingId);
      }
    });

    this.register("booking.releaseCalendar", class {
      async execute(bookingId: string) {
        return { success: true, bookingId, datesReleased: true };
      }
    });

    this.register("booking.notifyHost", class {
      async execute(bookingId: string, message: string) {
        return { success: true, sent: true };
      }
    });

    this.register("payment.process", class {
      async execute(bookingId: string, amount: number, paymentMethod: string) {
        return { success: true, paymentId: "pay-123", transactionId: "txn-123" };
      }
    });

    this.register("payment.refund", class {
      async execute(bookingId: string, reason: string) {
        return { success: true, refundId: "refund-123", transactionId: "txn-refund-123" };
      }
    });

    this.register("payment.reverseRefund", class {
      async execute(refundId: string) {
        return { success: true, reversed: true };
      }
    });

    this.register("review.create", class {
      async execute(bookingId: string, rating: number, comment: string) {
        return { success: true, reviewId: "review-123" };
      }
    });

    this.register("review.respond", class {
      async execute(reviewId: string, response: string) {
        return { success: true, reviewId, response };
      }
    });

    this.register("review.analyze", class {
      async execute(reviewId: string) {
        return { success: true, sentiment: "positive", keywords: ["great", "clean"] };
      }
    });

    this.register("listing.create", class { async execute(input: any) {
        return { success: true, listingId: "list-123" };
      }
    });

    this.register("listing.activate", class {
      async execute(listingId: string) {
        return { success: true, status: "active" };
      }
    });

    this.register("listing.deactivate", class {
      async execute(listingId: string) {
        return { success: true, status: "inactive" };
      }
    });

    this.register("listing.optimize", class {
      async execute(listingId: string) {
        return { success: true, optimizedListing: { id: listingId, optimized: true };
      }
    });

    this.register("listing.analyze", class {
      async execute(listingId: string) {
        return { success: true, analysisReport: { score: 95 } };
      }
    });
  }

  register(executorId: string, executorClass: ExecutorClass): void {
    this.executors.set(executorId, executorClass);
  }

  get(executorId: string): ExecutorClass {
    const executorClass = this.executors.get(executorId);
    if (!executorClass) {
      throw new Error(`Executor not found: ${executorId}`);
    }
    return executorClass;
  }
}
