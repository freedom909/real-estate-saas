import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

jest.mock("uuid", () => ({
  v4: () => "test-uuid-123",
}));

jest.mock("@/modules/tokens/booking.tokens", () => ({
  TOKENS_BOOKING: {
    repository: { bookingRepository: Symbol("BookingRepository") },
    gateway: { listingGateway: Symbol("ListingGateway") },
    eventBus: { eventBus: Symbol("EventBus") },
  },
}));

jest.mock("@/modules/tokens/event.bus.token", () => ({
  TOKENS_EVENT_BUS: { eventBus: Symbol("EventBus") },
}));

jest.mock("@/modules/tokens/calendar.tokens", () => ({
  TOKENS_CALENDAR: {
    repos: { calendarRepository: Symbol("CalendarRepository") },
    usecase: { reserveSlotUseCase: Symbol("ReserveSlotUseCase") },
  },
}));

jest.mock("@/shared/eventbus/in-memory-event-bus", () => ({
  InMemoryEventBus: class {},
}));

jest.mock("@/core/calendar/application/usecases/reserve-slot.usecase", () => ({
  ReserveSlotUseCase: class { execute = jest.fn(); },
}));

import { CreateBookingUseCase } from "@/core/booking/application/usecases/create-booking.usecase";

const mockRepo = {
  save: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  findById: jest.fn(),
  findByCustomerId: jest.fn(),
  delete: jest.fn(),
  findByLatestByCustomerId: jest.fn(),
};

const mockEventBus = {
  publish: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
};

const mockListingGateway = {
  getListingPrice: jest.fn<(id: string) => Promise<number>>(),
};

const mockReserveSlotUseCase = {
  execute: jest.fn().mockResolvedValue(undefined),
};

describe("CreateBookingUseCase", () => {
  let useCase: CreateBookingUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepo.save.mockResolvedValue(undefined);
    mockReserveSlotUseCase.execute.mockResolvedValue(undefined);
    useCase = new CreateBookingUseCase(
      mockRepo as any,
      mockEventBus as any,
      mockListingGateway as any,
      mockReserveSlotUseCase as any
    );
  });

  it("should calculate price from listing nightly rate x nights", async () => {
    mockListingGateway.getListingPrice.mockResolvedValue(500);

    const result = await useCase.execute({
      listingId: "listing-1",
      customerId: "customer-1",
      checkInDate: "2024-06-01",
      checkOutDate: "2024-06-04",
    });

    expect(mockListingGateway.getListingPrice).toHaveBeenCalledWith("listing-1");
    expect(result.price).toBe(1500);
  });

  it("should ignore input.price and always use listing price", async () => {
    mockListingGateway.getListingPrice.mockResolvedValue(800);

    const result = await useCase.execute({
      listingId: "listing-1",
      customerId: "customer-1",
      checkInDate: "2024-06-01",
      checkOutDate: "2024-06-03",
      price: 0,
    });

    expect(result.price).toBe(1600);
  });

  it("should throw if listing not found", async () => {
    mockListingGateway.getListingPrice.mockRejectedValue(
      new Error("Listing listing-999 not found")
    );

    await expect(
      useCase.execute({
        listingId: "listing-999",
        customerId: "customer-1",
        checkInDate: "2024-06-01",
        checkOutDate: "2024-06-04",
      })
    ).rejects.toThrow("Listing listing-999 not found");
  });

  it("should throw if checkInDate >= checkOutDate", async () => {
    mockListingGateway.getListingPrice.mockResolvedValue(500);

    await expect(
      useCase.execute({
        listingId: "listing-1",
        customerId: "customer-1",
        checkInDate: "2024-06-05",
        checkOutDate: "2024-06-04",
      })
    ).rejects.toThrow("checkInDate must be before checkOutDate");
  });

  it("should throw if required fields are missing", async () => {
    await expect(
      useCase.execute({
        listingId: "listing-1",
      })
    ).rejects.toThrow("Missing required booking information");
  });

  it("should save booking and publish event", async () => {
    mockListingGateway.getListingPrice.mockResolvedValue(500);

    const result = await useCase.execute({
      listingId: "listing-1",
      customerId: "customer-1",
      checkInDate: "2024-06-01",
      checkOutDate: "2024-06-04",
    });

    expect(mockRepo.save).toHaveBeenCalled();
    expect(mockEventBus.publish).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
