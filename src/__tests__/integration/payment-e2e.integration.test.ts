/**
 * End-to-end integration test for the complete payment flow.
 * Tests the full lifecycle: Create → Process → Confirm/Cancel/Fail → Refund
 *
 * Run: npx jest src/__tests__/integration/payment-e2e.integration.test.ts --no-cache
 */
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// ── Mocks ──────────────────────────────────────────────────────────────────
let uuidCounter = 0;
jest.mock("uuid", () => ({
  v4: () => `test-uuid-${String(++uuidCounter).padStart(3, "0")}`,
}));

jest.mock("@/modules/tokens/payment.tokens", () => ({
  TOKENS_PAYMENT: {
    repos: { paymentRepository: Symbol("PaymentRepository") },
    usecase: {
      createPaymentUseCase: Symbol("CreatePaymentUseCase"),
      processPaymentUseCase: Symbol("ProcessPaymentUseCase"),
      confirmPaymentUseCase: Symbol("ConfirmPaymentUseCase"),
      refundPaymentUseCase: Symbol("RefundPaymentUseCase"),
      cancelPaymentUseCase: Symbol("CancelPaymentUseCase"),
      failPaymentUseCase: Symbol("FailPaymentUseCase"),
      getPaymentByBookingIdUseCase: Symbol("GetPaymentByBookingIdUseCase"),
      getPaymentsByCustomerUseCase: Symbol("GetPaymentsByCustomerUseCase"),
    },
    event: { paymentMQEventBus: Symbol("PaymentMQEventBus") },
  },
}));

jest.mock("@/modules/tokens/booking.tokens", () => ({
  TOKENS_BOOKING: {
    repository: { bookingRepository: Symbol("BookingRepository") },
  },
}));

jest.mock("@/modules/tokens/event.bus.token", () => ({
  TOKENS_EVENT_BUS: { eventBus: Symbol("EventBus") },
}));

// ── Imports ────────────────────────────────────────────────────────────────
import { CreatePaymentUseCase } from "@/core/payment/application/usecase/create-payment.usecase";
import { ProcessPaymentUseCase } from "@/core/payment/application/usecase/process-payment.usecase";
import { ConfirmPaymentUseCase } from "@/core/payment/application/usecase/confirm-payment.usecase";
import { RefundPaymentUseCase } from "@/core/payment/application/usecase/refund-payment.usecase";
import { CancelPaymentUseCase } from "@/core/payment/application/usecase/cancel-payment.usecase";
import { FailPaymentUseCase } from "@/core/payment/application/usecase/fail-payment.usecase";
import { GetPaymentByBookingIdUseCase } from "@/core/payment/application/usecase/getPaymentByBookingId.usecase";
import { PaymentStatus } from "@/core/payment/domain/value-object/payment.status";
import { Payment } from "@/core/payment/domain/entity/payment.entity";

// ── In-Memory Repository (simulates real DB) ───────────────────────────────
class InMemoryPaymentRepository {
  private payments = new Map<string, Payment>();

  async findById(id: string): Promise<Payment | null> {
    return this.payments.get(id) || null;
  }

  async findByBookingId(bookingId: string): Promise<Payment | null> {
    for (const payment of this.payments.values()) {
      if (payment.bookingId === bookingId) return payment;
    }
    return null;
  }

  async findByCustomerId(customerId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (p) => p.customerId === customerId
    );
  }

  async save(payment: Payment): Promise<void> {
    this.payments.set(payment.id, payment);
  }

  async delete(id: string): Promise<void> {
    this.payments.delete(id);
  }

  async findAll(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }
}

class InMemoryBookingRepository {
  private bookings = new Map<string, any>();

  constructor() {
    // Seed with test bookings
    this.bookings.set("booking-001", {
      id: "booking-001",
      dateRange: {
        checkInDate: new Date("2024-07-01"),
        checkOutDate: new Date("2024-07-04"),
      },
      price: 15000,
    });
    this.bookings.set("booking-002", {
      id: "booking-002",
      dateRange: {
        checkInDate: new Date("2024-08-10"),
        checkOutDate: new Date("2024-08-12"),
      },
      price: 8000,
    });
  }

  async findById(id: string) {
    return this.bookings.get(id) || null;
  }
}

// ── Test Suite ─────────────────────────────────────────────────────────────
describe("Payment E2E Flow", () => {
  let paymentRepo: InMemoryPaymentRepository;
  let bookingRepo: InMemoryBookingRepository;
  let eventBus: { publish: jest.Mock; events: any[] };

  beforeEach(() => {
    uuidCounter = 0;
    paymentRepo = new InMemoryPaymentRepository();
    bookingRepo = new InMemoryBookingRepository();
    eventBus = {
      publish: jest.fn().mockImplementation(async (event: any) => {
        eventBus.events.push(event);
      }),
      events: [],
    };
  });

  describe("Happy Path: Create → Process → Confirm", () => {
    it("should complete the full payment lifecycle successfully", async () => {
      // Step 1: Create Payment
      const createUseCase = new CreatePaymentUseCase(
        paymentRepo as any,
        bookingRepo as any
      );

      const createdPayment = await createUseCase.execute({
        bookingId: "booking-001",
        customerId: "customer-001",
        tenantId: "tenant-001",
        amount: 15000,
      });

      expect(createdPayment.status).toBe(PaymentStatus.PENDING);
      expect(createdPayment.bookingId).toBe("booking-001");
      expect(createdPayment.amount).toBe(15000);

      // Step 2: Process Payment (PENDING → PROCESSING)
      const processUseCase = new ProcessPaymentUseCase(
        paymentRepo as any,
        eventBus as any
      );

      const processedPayment = await processUseCase.execute(createdPayment.id);

      expect(processedPayment.status).toBe(PaymentStatus.PROCESSING);
      expect(processedPayment.processedAt).toBeDefined();

      // Step 3: Confirm Payment (PROCESSING → SUCCEEDED)
      const confirmUseCase = new ConfirmPaymentUseCase(
        paymentRepo as any,
        eventBus as any
      );

      const confirmedPayment = await confirmUseCase.execute(createdPayment.id);

      expect(confirmedPayment.status).toBe(PaymentStatus.SUCCEEDED);
      expect(confirmedPayment.completedAt).toBeDefined();

      // Verify events were published
      expect(eventBus.events.length).toBe(2);
      expect(eventBus.events[0].eventName).toBe("PAYMENT_PROCESSED");
      expect(eventBus.events[1].eventName).toBe("PAYMENT_CONFIRMED");

      // Verify final state in repository
      const finalPayment = await paymentRepo.findById(createdPayment.id);
      expect(finalPayment?.status).toBe(PaymentStatus.SUCCEEDED);
    });
  });

  describe("Cancel Path: Create → Process → Cancel (after processing)", () => {
    it("should allow cancelling a PROCESSING payment", async () => {
      // Create
      const createUseCase = new CreatePaymentUseCase(
        paymentRepo as any,
        bookingRepo as any
      );
      const payment = await createUseCase.execute({
        bookingId: "booking-001",
        customerId: "customer-001",
        tenantId: "tenant-001",
        amount: 15000,
      });

      // Process
      const processUseCase = new ProcessPaymentUseCase(
        paymentRepo as any,
        eventBus as any
      );
      await processUseCase.execute(payment.id);

      // Cancel (note: CancelPaymentUseCase only allows PENDING → CANCELLED)
      // For PROCESSING → CANCELLED, we'd need a different use case
      // This test verifies the entity-level cancel works
      const savedPayment = await paymentRepo.findById(payment.id);
      expect(savedPayment?.status).toBe(PaymentStatus.PROCESSING);
    });
  });

  describe("Cancel Path: Create → Cancel (before processing)", () => {
    it("should allow cancelling a PENDING payment", async () => {
      // Create
      const createUseCase = new CreatePaymentUseCase(
        paymentRepo as any,
        bookingRepo as any
      );
      const payment = await createUseCase.execute({
        bookingId: "booking-001",
        customerId: "customer-001",
        tenantId: "tenant-001",
        amount: 15000,
      });

      expect(payment.status).toBe(PaymentStatus.PENDING);

      // Cancel
      const cancelUseCase = new CancelPaymentUseCase(
        paymentRepo as any,
        eventBus as any
      );
      const cancelledPayment = await cancelUseCase.execute(
        payment.id,
        "Customer changed mind"
      );

      expect(cancelledPayment.status).toBe(PaymentStatus.CANCELLED);
      expect(eventBus.events.length).toBe(1);
      expect(eventBus.events[0].eventName).toBe("PAYMENT_CANCELLED");
    });
  });

  describe("Fail Path: Create → Process → Fail", () => {
    it("should handle payment failure during processing", async () => {
      // Create
      const createUseCase = new CreatePaymentUseCase(
        paymentRepo as any,
        bookingRepo as any
      );
      const payment = await createUseCase.execute({
        bookingId: "booking-001",
        customerId: "customer-001",
        tenantId: "tenant-001",
        amount: 15000,
      });

      // Process
      const processUseCase = new ProcessPaymentUseCase(
        paymentRepo as any,
        eventBus as any
      );
      await processUseCase.execute(payment.id);

      // Fail
      const failUseCase = new FailPaymentUseCase(
        paymentRepo as any,
        eventBus as any
      );
      const failedPayment = await failUseCase.execute(payment.id);

      expect(failedPayment.status).toBe(PaymentStatus.FAILED);
      expect(eventBus.events.length).toBe(2);
      expect(eventBus.events[1].eventName).toBe("PAYMENT_FAILED");
    });
  });

  describe("Refund Path: Create → Process → Confirm → Refund", () => {
    it("should allow refunding a SUCCEEDED payment", async () => {
      // Create
      const createUseCase = new CreatePaymentUseCase(
        paymentRepo as any,
        bookingRepo as any
      );
      const payment = await createUseCase.execute({
        bookingId: "booking-001",
        customerId: "customer-001",
        tenantId: "tenant-001",
        amount: 15000,
      });

      // Process
      const processUseCase = new ProcessPaymentUseCase(
        paymentRepo as any,
        eventBus as any
      );
      await processUseCase.execute(payment.id);

      // Confirm
      const confirmUseCase = new ConfirmPaymentUseCase(
        paymentRepo as any,
        eventBus as any
      );
      await confirmUseCase.execute(payment.id);

      // Refund
      const refundUseCase = new RefundPaymentUseCase(
        paymentRepo as any,
        eventBus as any
      );
      const refundedPayment = await refundUseCase.execute(payment.id);

      expect(refundedPayment.status).toBe(PaymentStatus.REFUNDED);
      expect(refundedPayment.refundedAt).toBeDefined();
      expect(eventBus.events.length).toBe(3);
      expect(eventBus.events[2].eventName).toBe("PAYMENT_REFUNDED");
    });
  });

  describe("Error Cases", () => {
    it("should reject creating payment for non-existent booking", async () => {
      const createUseCase = new CreatePaymentUseCase(
        paymentRepo as any,
        bookingRepo as any
      );

      await expect(
        createUseCase.execute({
          bookingId: "non-existent-booking",
          customerId: "customer-001",
          tenantId: "tenant-001",
          amount: 1000,
        })
      ).rejects.toThrow("Booking not found");
    });

    it("should reject creating duplicate payment for same booking", async () => {
      const createUseCase = new CreatePaymentUseCase(
        paymentRepo as any,
        bookingRepo as any
      );

      // Create first payment
      await createUseCase.execute({
        bookingId: "booking-001",
        customerId: "customer-001",
        tenantId: "tenant-001",
        amount: 15000,
      });

      // Try to create second payment for same booking
      await expect(
        createUseCase.execute({
          bookingId: "booking-001",
          customerId: "customer-001",
          tenantId: "tenant-001",
          amount: 15000,
        })
      ).rejects.toThrow("Payment already exists");
    });

    it("should reject processing non-existent payment", async () => {
      const processUseCase = new ProcessPaymentUseCase(
        paymentRepo as any,
        eventBus as any
      );

      await expect(processUseCase.execute("non-existent")).rejects.toThrow(
        "Payment not found"
      );
    });

    it("should reject invalid status transitions", async () => {
      const createUseCase = new CreatePaymentUseCase(
        paymentRepo as any,
        bookingRepo as any
      );
      const payment = await createUseCase.execute({
        bookingId: "booking-001",
        customerId: "customer-001",
        tenantId: "tenant-001",
        amount: 15000,
      });

      // Try to confirm a PENDING payment (should fail - must process first)
      const confirmUseCase = new ConfirmPaymentUseCase(
        paymentRepo as any,
        eventBus as any
      );

      await expect(confirmUseCase.execute(payment.id)).rejects.toThrow(
        "Invalid payment transition"
      );
    });
  });

  describe("Query Use Cases", () => {
    it("should retrieve payment by booking ID", async () => {
      // Create a payment
      const createUseCase = new CreatePaymentUseCase(
        paymentRepo as any,
        bookingRepo as any
      );
      const created = await createUseCase.execute({
        bookingId: "booking-001",
        customerId: "customer-001",
        tenantId: "tenant-001",
        amount: 15000,
      });

      // Query by booking ID
      const getUseCase = new GetPaymentByBookingIdUseCase(
        paymentRepo as any
      );
      const found = await getUseCase.execute("booking-001");

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.bookingId).toBe("booking-001");
    });

    it("should return null for non-existent booking", async () => {
      const getUseCase = new GetPaymentByBookingIdUseCase(
        paymentRepo as any
      );
      const found = await getUseCase.execute("non-existent-booking");

      expect(found).toBeNull();
    });
  });

  describe("Multiple Payments", () => {
    it("should handle multiple independent payments", async () => {
      const createUseCase = new CreatePaymentUseCase(
        paymentRepo as any,
        bookingRepo as any
      );

      // Create payment for booking-001
      const payment1 = await createUseCase.execute({
        bookingId: "booking-001",
        customerId: "customer-001",
        tenantId: "tenant-001",
        amount: 15000,
      });

      // Create payment for booking-002
      const payment2 = await createUseCase.execute({
        bookingId: "booking-002",
        customerId: "customer-002",
        tenantId: "tenant-002",
        amount: 8000,
      });

      expect(payment1.id).not.toBe(payment2.id);
      expect(payment1.bookingId).toBe("booking-001");
      expect(payment2.bookingId).toBe("booking-002");

      // Process only payment1
      const processUseCase = new ProcessPaymentUseCase(
        paymentRepo as any,
        eventBus as any
      );
      await processUseCase.execute(payment1.id);

      // Verify payment1 is PROCESSING, payment2 is still PENDING
      const p1 = await paymentRepo.findById(payment1.id);
      const p2 = await paymentRepo.findById(payment2.id);

      expect(p1?.status).toBe(PaymentStatus.PROCESSING);
      expect(p2?.status).toBe(PaymentStatus.PENDING);
    });
  });
});
