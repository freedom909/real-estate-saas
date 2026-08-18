import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

jest.mock("uuid", () => ({
  v4: () => "test-uuid-456",
}));

jest.mock("@/modules/tokens/booking.tokens", () => ({
  TOKENS_BOOKING: {
    repository: { bookingRepository: Symbol("BookingRepository") },
  },
}));

jest.mock("@/modules/tokens/event.bus.token", () => ({
  TOKENS_EVENT_BUS: { eventBus: Symbol("EventBus") },
}));

jest.mock("@/modules/tokens/payment.tokens", () => ({
  TOKENS_PAYMENT: {
    repos: { paymentRepository: Symbol("PaymentRepository") },
  },
}));

jest.mock("@/shared/eventbus/in-memory-event-bus", () => ({
  InMemoryEventBus: class {},
}));

import { ConfirmBookingUseCase } from "@/core/booking/application/usecases/confirm-booking.usecase";
import { Booking } from "@/core/booking/domain/entities/booking.entity";
import { DateRange } from "@/core/booking/domain/value-objects/date-range.vo";

function createPendingBooking(id: string = "booking-1"): Booking {
  return Booking.rehydrate({
    id,
    listingId: "listing-1",
    customerId: "customer-1",
    tenantId: "tenant-1",
    dateRange: new DateRange(new Date("2099-08-01"), new Date("2099-08-04")),
    price: 15000,
    status: "PENDING" as any,
    createdAt: new Date("2024-07-01"),
    lifecycleStatus: "UPCOMING" as any,
  });
}

describe("ConfirmBookingUseCase", () => {
  let useCase: ConfirmBookingUseCase;
  let mockBookingRepo: any;
  let mockPaymentRepo: any;
  let mockEventBus: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBookingRepo = {
      findById: jest.fn(),
      save: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      findByCustomerId: jest.fn(),
      delete: jest.fn(),
      findByLatestByCustomerId: jest.fn(),
    };
    mockPaymentRepo = {
      findByBookingId: jest.fn(),
      save: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      delete: jest.fn(),
    };
    mockEventBus = {
      publish: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };
    useCase = new ConfirmBookingUseCase(mockBookingRepo, mockPaymentRepo, mockEventBus);
  });

  it("should confirm a pending booking", async () => {
    const booking = createPendingBooking();
    mockBookingRepo.findById.mockResolvedValue(booking);
    mockPaymentRepo.findByBookingId.mockResolvedValue(null);

    await useCase.execute("booking-1");

    expect(mockBookingRepo.findById).toHaveBeenCalledWith("booking-1");
    expect(mockBookingRepo.save).toHaveBeenCalledTimes(1);
    expect(mockPaymentRepo.findByBookingId).toHaveBeenCalledWith("booking-1");
    expect(mockPaymentRepo.save).toHaveBeenCalledTimes(1);
    expect(mockEventBus.publish).toHaveBeenCalledTimes(1);
  });

  it("should throw if booking not found", async () => {
    mockBookingRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute("nonexistent")).rejects.toThrow("Booking not found");
  });

  it("should throw if booking is already confirmed", async () => {
    const booking = createPendingBooking();
    booking.confirm(); // transition to CONFIRMED first
    mockBookingRepo.findById.mockResolvedValue(booking);

    await expect(useCase.execute("booking-1")).rejects.toThrow(
      "Cannot confirm a booking in CONFIRMED status"
    );
  });

  it("should throw if booking is cancelled", async () => {
    const booking = createPendingBooking();
    booking.cancel("test reason");
    mockBookingRepo.findById.mockResolvedValue(booking);

    await expect(useCase.execute("booking-1")).rejects.toThrow(
      "Cannot confirm a booking in CANCELLED status"
    );
  });

  it("should publish BookingConfirmedEvent with correct data", async () => {
    const booking = createPendingBooking();
    mockBookingRepo.findById.mockResolvedValue(booking);
    mockPaymentRepo.findByBookingId.mockResolvedValue(null);

    await useCase.execute("booking-1");

    const event = mockEventBus.publish.mock.calls[0][0];
    expect(event.bookingId).toBe("booking-1");
    expect(event.customerId).toBe("customer-1");
    expect(event.tenantId).toBe("tenant-1");
  });

  it("should not create a duplicate payment when one already exists", async () => {
    const booking = createPendingBooking();
    mockBookingRepo.findById.mockResolvedValue(booking);
    mockPaymentRepo.findByBookingId.mockResolvedValue({ id: "payment-1" });

    await useCase.execute("booking-1");

    expect(mockPaymentRepo.findByBookingId).toHaveBeenCalledWith("booking-1");
    expect(mockPaymentRepo.save).not.toHaveBeenCalled();
  });
});
