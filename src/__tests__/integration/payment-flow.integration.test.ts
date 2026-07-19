/**
 * Integration test for the payment creation flow.
 * Tests: CreatePaymentUseCase → Payment Entity → PaymentRepository
 *
 * Run: npx jest src/__tests__/integration/payment-flow.integration.test.ts --no-cache
 */
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// ── Mocks ──────────────────────────────────────────────────────────────────
jest.mock("uuid", () => ({ v4: () => "test-payment-uuid-001" }));

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
import { PaymentStatus } from "@/core/payment/domain/value-object/payment.status";
import { PaymentTransitionService } from "@/core/payment/domain/service/paymentTransition.service";

// ── Helpers ────────────────────────────────────────────────────────────────
function createMocks() {
  const savedPayments: any[] = [];
  const paymentRepo: any = {
    save: jest.fn().mockImplementation(async (p: any) => {
      savedPayments.push(p);
    }),
    findById: jest.fn(),
    findByBookingId: jest.fn(),
    findByCustomerId: jest.fn(),
    delete: jest.fn(),
  };
  const bookingRepo: any = {
    findById: jest.fn(),
  };
  const eventBus: any = { publish: jest.fn() };
  eventBus.publish.mockResolvedValue(undefined);
  return { paymentRepo, bookingRepo, eventBus, savedPayments };
}

function mockBooking(id: string, amount: number) {
  return {
    id,
    dateRange: {
      checkInDate: new Date("2024-07-01"),
      checkOutDate: new Date("2024-07-04"),
    },
    price: amount,
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────
describe("Payment creation flow (integration)", () => {
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(() => {
    jest.clearAllMocks();
    mocks = createMocks();
  });

  describe("CreatePaymentUseCase", () => {
    it("creates a payment with PENDING status", async () => {
      mocks.bookingRepo.findById.mockResolvedValue(mockBooking("booking-1", 15000));
      mocks.paymentRepo.findByBookingId.mockResolvedValue(null);

      const useCase = new CreatePaymentUseCase(
        mocks.paymentRepo as any,
        mocks.bookingRepo as any
      );

      const payment = await useCase.execute({
        bookingId: "booking-1",
        customerId: "customer-1",
        tenantId: "tenant-1",
        amount: 15000,
      });

      expect(payment.status).toBe(PaymentStatus.PENDING);
      expect(payment.bookingId).toBe("booking-1");
      expect(payment.customerId).toBe("customer-1");
      expect(payment.amount).toBe(15000);
      expect(mocks.paymentRepo.save).toHaveBeenCalledTimes(1);
    });

    it("rejects if booking not found", async () => {
      mocks.bookingRepo.findById.mockResolvedValue(null);

      const useCase = new CreatePaymentUseCase(
        mocks.paymentRepo as any,
        mocks.bookingRepo as any
      );

      await expect(
        useCase.execute({
          bookingId: "nonexistent",
          customerId: "customer-1",
          tenantId: "tenant-1",
          amount: 1000,
        })
      ).rejects.toThrow("Booking not found");
    });

    it("rejects if payment already exists for booking", async () => {
      mocks.bookingRepo.findById.mockResolvedValue(mockBooking("booking-1", 15000));
      mocks.paymentRepo.findByBookingId.mockResolvedValue({ id: "existing-payment" });

      const useCase = new CreatePaymentUseCase(
        mocks.paymentRepo as any,
        mocks.bookingRepo as any
      );

      await expect(
        useCase.execute({
          bookingId: "booking-1",
          customerId: "customer-1",
          tenantId: "tenant-1",
          amount: 15000,
        })
      ).rejects.toThrow("Payment already exists");
    });
  });

  describe("ProcessPaymentUseCase", () => {
    it("transitions PENDING → PROCESSING", async () => {
      const payment = {
        id: "pay-1",
        bookingId: "booking-1",
        status: PaymentStatus.PENDING,
        process: jest.fn(),
        toJSON: () => ({ id: "pay-1", status: PaymentStatus.PROCESSING }),
        checkInDate: new Date("2024-07-01"),
        checkOutDate: new Date("2024-07-04"),
        processedAt: new Date(),
      };
      mocks.paymentRepo.findById.mockResolvedValue(payment);

      const useCase = new ProcessPaymentUseCase(
        mocks.paymentRepo as any,
        mocks.eventBus as any
      );

      await useCase.execute("pay-1");

      expect(payment.process).toHaveBeenCalled();
      expect(mocks.paymentRepo.save).toHaveBeenCalledTimes(1);
      expect(mocks.eventBus.publish).toHaveBeenCalledTimes(1);
    });

    it("throws if payment not found", async () => {
      mocks.paymentRepo.findById.mockResolvedValue(null);

      const useCase = new ProcessPaymentUseCase(
        mocks.paymentRepo as any,
        mocks.eventBus as any
      );

      await expect(useCase.execute("nonexistent")).rejects.toThrow("Payment not found");
    });
  });

  describe("ConfirmPaymentUseCase", () => {
    it("transitions PROCESSING → SUCCEEDED", async () => {
      const payment = {
        id: "pay-1",
        bookingId: "booking-1",
        customerId: "customer-1",
        tenantId: "tenant-1",
        amount: 15000,
        status: PaymentStatus.PROCESSING,
        succeed: jest.fn(),
        toJSON: () => ({ id: "pay-1", status: PaymentStatus.SUCCEEDED }),
        checkInDate: new Date("2024-07-01"),
        checkOutDate: new Date("2024-07-04"),
        completedAt: new Date(),
      };
      mocks.paymentRepo.findById.mockResolvedValue(payment);

      const useCase = new ConfirmPaymentUseCase(
        mocks.paymentRepo as any,
        mocks.eventBus as any
      );

      await useCase.execute("pay-1");

      expect(payment.succeed).toHaveBeenCalled();
      expect(mocks.paymentRepo.save).toHaveBeenCalledTimes(1);
      expect(mocks.eventBus.publish).toHaveBeenCalledTimes(1);
    });

    it("skips if already SUCCEEDED", async () => {
      const payment = {
        id: "pay-1",
        status: PaymentStatus.SUCCEEDED,
        succeed: jest.fn(),
        toJSON: () => ({ id: "pay-1", status: PaymentStatus.SUCCEEDED }),
      };
      mocks.paymentRepo.findById.mockResolvedValue(payment);

      const useCase = new ConfirmPaymentUseCase(
        mocks.paymentRepo as any,
        mocks.eventBus as any
      );

      const result = await useCase.execute("pay-1");

      expect(payment.succeed).not.toHaveBeenCalled();
      expect(mocks.paymentRepo.save).not.toHaveBeenCalled();
      expect(result.status).toBe(PaymentStatus.SUCCEEDED);
    });
  });

  describe("RefundPaymentUseCase", () => {
    it("transitions SUCCEEDED → REFUNDED", async () => {
      const payment = {
        id: "pay-1",
        status: PaymentStatus.SUCCEEDED,
        refund: jest.fn(),
        toJSON: () => ({ id: "pay-1", status: PaymentStatus.REFUNDED }),
        checkInDate: new Date("2024-07-01"),
        checkOutDate: new Date("2024-07-04"),
        refundedAt: new Date(),
      };
      mocks.paymentRepo.findById.mockResolvedValue(payment);

      const useCase = new RefundPaymentUseCase(
        mocks.paymentRepo as any,
        mocks.eventBus as any
      );

      await useCase.execute("pay-1");

      expect(payment.refund).toHaveBeenCalled();
      expect(mocks.paymentRepo.save).toHaveBeenCalledTimes(1);
      expect(mocks.eventBus.publish).toHaveBeenCalledTimes(1);
    });
  });

  describe("CancelPaymentUseCase", () => {
    it("transitions PENDING → CANCELLED with reason", async () => {
      const payment = {
        id: "pay-1",
        status: PaymentStatus.PENDING,
        cancel: jest.fn(),
        toJSON: () => ({ id: "pay-1", status: PaymentStatus.CANCELLED }),
        checkInDate: new Date("2024-07-01"),
        checkOutDate: new Date("2024-07-04"),
      };
      mocks.paymentRepo.findById.mockResolvedValue(payment);

      const useCase = new CancelPaymentUseCase(
        mocks.paymentRepo as any,
        mocks.eventBus as any
      );

      await useCase.execute("pay-1", "Customer request");

      expect(payment.cancel).toHaveBeenCalledWith("Customer request");
      expect(mocks.paymentRepo.save).toHaveBeenCalledTimes(1);
      expect(mocks.eventBus.publish).toHaveBeenCalledTimes(1);
    });
  });

  describe("FailPaymentUseCase", () => {
    it("transitions PROCESSING → FAILED", async () => {
      const payment = {
        id: "pay-1",
        bookingId: "booking-1",
        customerId: "customer-1",
        tenantId: "tenant-1",
        amount: 15000,
        status: PaymentStatus.PROCESSING,
        fail: jest.fn(),
        toJSON: () => ({ id: "pay-1", status: PaymentStatus.FAILED }),
      };
      mocks.paymentRepo.findById.mockResolvedValue(payment);

      const useCase = new FailPaymentUseCase(
        mocks.paymentRepo as any,
        mocks.eventBus as any
      );

      await useCase.execute("pay-1");

      expect(payment.fail).toHaveBeenCalled();
      expect(mocks.paymentRepo.save).toHaveBeenCalledTimes(1);
      expect(mocks.eventBus.publish).toHaveBeenCalledTimes(1);
    });
  });

  describe("PaymentTransitionService", () => {
    it("allows PENDING → PROCESSING", () => {
      expect(() =>
        PaymentTransitionService.ensureTransition(PaymentStatus.PENDING, PaymentStatus.PROCESSING)
      ).not.toThrow();
    });

    it("allows PENDING → CANCELLED", () => {
      expect(() =>
        PaymentTransitionService.ensureTransition(PaymentStatus.PENDING, PaymentStatus.CANCELLED)
      ).not.toThrow();
    });

    it("allows PROCESSING → SUCCEEDED", () => {
      expect(() =>
        PaymentTransitionService.ensureTransition(PaymentStatus.PROCESSING, PaymentStatus.SUCCEEDED)
      ).not.toThrow();
    });

    it("allows PROCESSING → FAILED", () => {
      expect(() =>
        PaymentTransitionService.ensureTransition(PaymentStatus.PROCESSING, PaymentStatus.FAILED)
      ).not.toThrow();
    });

    it("allows SUCCEEDED → REFUNDED", () => {
      expect(() =>
        PaymentTransitionService.ensureTransition(PaymentStatus.SUCCEEDED, PaymentStatus.REFUNDED)
      ).not.toThrow();
    });

    it("rejects PENDING → SUCCEEDED (must go through PROCESSING)", () => {
      expect(() =>
        PaymentTransitionService.ensureTransition(PaymentStatus.PENDING, PaymentStatus.SUCCEEDED)
      ).toThrow("Invalid payment transition");
    });

    it("rejects FAILED → anything", () => {
      expect(() =>
        PaymentTransitionService.ensureTransition(PaymentStatus.FAILED, PaymentStatus.SUCCEEDED)
      ).toThrow("Invalid payment transition");
    });

    it("rejects REFUNDED → anything", () => {
      expect(() =>
        PaymentTransitionService.ensureTransition(PaymentStatus.REFUNDED, PaymentStatus.SUCCEEDED)
      ).toThrow("Invalid payment transition");
    });

    it("rejects CANCELLED → anything", () => {
      expect(() =>
        PaymentTransitionService.ensureTransition(PaymentStatus.CANCELLED, PaymentStatus.SUCCEEDED)
      ).toThrow("Invalid payment transition");
    });
  });
});
