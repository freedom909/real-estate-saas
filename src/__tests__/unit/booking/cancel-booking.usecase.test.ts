import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

jest.mock("@/modules/tokens/booking.tokens", () => ({
  TOKENS_BOOKING: {
    repository: { bookingRepository: Symbol("BookingRepository") },
  },
}));

jest.mock("@/modules/tokens/event.bus.token", () => ({
  TOKENS_EVENT_BUS: { eventBus: Symbol("EventBus") },
}));

jest.mock("@/modules/tokens/calendar.tokens", () => ({
  TOKENS_CALENDAR: {
    usecase: { releaseSlotUseCase: Symbol("ReleaseSlotUseCase") },
    repos: { calendarRepository: Symbol("CalendarRepository") },
  },
}));

jest.mock("@/shared/eventbus/in-memory-event-bus", () => ({
  InMemoryEventBus: class {},
}));

// Mock the ReleaseSlotUseCase class itself to prevent decorator evaluation
jest.mock("@/core/calendar/application/usecases/release-slot.usecase", () => ({
  ReleaseSlotUseCase: class {
    execute = jest.fn();
  },
}));

import { CancelBookingUseCase } from "@/core/booking/application/usecases/cancel-booking.usecase";
import { Booking } from "@/core/booking/domain/entities/booking.entity";
import { DateRange } from "@/core/booking/domain/value-objects/date-range.vo";

function createConfirmedBooking(id: string = "booking-1"): Booking {
  const booking = Booking.rehydrate({
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
  booking.confirm();
  return booking;
}

describe("CancelBookingUseCase", () => {
  let useCase: CancelBookingUseCase;
  let mockBookingRepo: any;
  let mockEventBus: any;
  let mockReleaseSlotUseCase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBookingRepo = {
      findById: jest.fn(),
      save: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };
    mockEventBus = {
      publish: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };
    mockReleaseSlotUseCase = {
      execute: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };
    useCase = new CancelBookingUseCase(
      mockBookingRepo,
      mockEventBus,
      mockReleaseSlotUseCase
    );
  });

  it("should cancel a confirmed booking", async () => {
    const booking = createConfirmedBooking();
    mockBookingRepo.findById.mockResolvedValue(booking);

    const result = await useCase.execute("booking-1", "change of plans");

    expect(mockBookingRepo.findById).toHaveBeenCalledWith("booking-1");
    expect(mockBookingRepo.save).toHaveBeenCalledTimes(1);
    expect(result.status).toBe("CANCELLED");
    expect(result.toJSON().cancelReason).toBe("change of plans");
  });

  it("should release calendar slots after cancellation", async () => {
    const booking = createConfirmedBooking();
    mockBookingRepo.findById.mockResolvedValue(booking);

    await useCase.execute("booking-1", "no longer needed");

    expect(mockReleaseSlotUseCase.execute).toHaveBeenCalledWith({
      bookingId: "booking-1",
      reason: "no longer needed",
    });
  });

  it("should still cancel even if calendar release fails", async () => {
    const booking = createConfirmedBooking();
    mockBookingRepo.findById.mockResolvedValue(booking);
    mockReleaseSlotUseCase.execute.mockRejectedValue(new Error("Calendar service down"));

    const result = await useCase.execute("booking-1", "urgent cancel");

    expect(result.status).toBe("CANCELLED");
    expect(mockBookingRepo.save).toHaveBeenCalledTimes(1);
    expect(mockEventBus.publish).toHaveBeenCalledTimes(1);
  });

  it("should publish BookingCancelledEvent", async () => {
    const booking = createConfirmedBooking();
    mockBookingRepo.findById.mockResolvedValue(booking);

    await useCase.execute("booking-1", "test reason");

    expect(mockEventBus.publish).toHaveBeenCalledTimes(1);
    const event = mockEventBus.publish.mock.calls[0][0];
    expect(event).toBeDefined();
  });

  it("should throw if booking not found", async () => {
    mockBookingRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute("nonexistent", "reason")).rejects.toThrow("Booking not found");
  });

  it("should throw if booking is already cancelled", async () => {
    const booking = createConfirmedBooking();
    booking.cancel("first cancel");
    mockBookingRepo.findById.mockResolvedValue(booking);

    await expect(useCase.execute("booking-1", "second cancel")).rejects.toThrow(
      "Booking is already cancelled"
    );
  });

  it("should throw if booking is completed", async () => {
    const booking = createConfirmedBooking();
    // Force completed status via rehydrate
    const completedBooking = Booking.rehydrate({
      id: "booking-1",
      listingId: "listing-1",
      customerId: "customer-1",
      tenantId: "tenant-1",
      dateRange: new DateRange(new Date("2099-08-01"), new Date("2099-08-04")),
      price: 15000,
      status: "COMPLETED" as any,
      createdAt: new Date("2024-07-01"),
      lifecycleStatus: "UPCOMING" as any,
      completedAt: new Date(),
    });
    mockBookingRepo.findById.mockResolvedValue(completedBooking);

    await expect(useCase.execute("booking-1", "too late")).rejects.toThrow(
      "Cannot cancel a completed booking"
    );
  });
});
