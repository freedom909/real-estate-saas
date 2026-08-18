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
    acl: { calendarClient: Symbol("CalendarClient") },
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

const mockCalendarClient = {
  reserveSlot: jest.fn().mockResolvedValue(undefined),
  releaseSlot: jest.fn().mockResolvedValue(undefined),
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
      mockCalendarClient as any
    );
  });

  const actor = { customerId: "customer-1" };

  it("should calculate price from listing nightly rate x nights", async () => {
    mockListingGateway.getListingPrice.mockResolvedValue(500);

    const result = await useCase.execute({
      listingId: "listing-1",
      checkInDate: "2024-06-01",
      checkOutDate: "2024-06-04",
    }, actor);

    expect(mockListingGateway.getListingPrice).toHaveBeenCalledWith("listing-1");
    expect(result.price).toBe(1500);
  });

  it("should ignore input.price and always use listing price", async () => {
    mockListingGateway.getListingPrice.mockResolvedValue(800);

    const result = await useCase.execute({
      listingId: "listing-1",
      checkInDate: "2024-06-01",
      checkOutDate: "2024-06-03",
      price: 0,
    }, actor);

    expect(result.price).toBe(1600);
  });

  it("should throw if listing not found", async () => {
    mockListingGateway.getListingPrice.mockRejectedValue(
      new Error("Listing listing-999 not found")
    );

    await expect(
      useCase.execute({
        listingId: "listing-999",
        checkInDate: "2024-06-01",
        checkOutDate: "2024-06-04",
      }, actor)
    ).rejects.toThrow("Listing listing-999 not found");
  });

  it("should throw if checkInDate >= checkOutDate", async () => {
    await expect(
      useCase.execute({
        listingId: "listing-1",
        checkInDate: "2024-06-05",
        checkOutDate: "2024-06-04",
      }, actor)
    ).rejects.toThrow("checkInDate must be before checkOutDate");
  });

  it("should throw if required fields are missing", async () => {
    await expect(
      useCase.execute({
        listingId: "listing-1",
      } as any, actor)
    ).rejects.toThrow("Missing required booking information");
  });

  it("should throw if customerId is missing from actor", async () => {
    await expect(
      useCase.execute({
        listingId: "listing-1",
        checkInDate: "2024-06-01",
        checkOutDate: "2024-06-04",
      }, {} as any)
    ).rejects.toThrow("Missing required authentication: customerId");
  });

  it("should save booking and publish event", async () => {
    mockListingGateway.getListingPrice.mockResolvedValue(500);

    const result = await useCase.execute({
      listingId: "listing-1",
      checkInDate: "2024-06-01",
      checkOutDate: "2024-06-04",
    }, actor);

    expect(mockRepo.save).toHaveBeenCalled();
    expect(mockEventBus.publish).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("should reserve calendar slot on creation", async () => {
    mockListingGateway.getListingPrice.mockResolvedValue(500);

    await useCase.execute({
      listingId: "listing-1",
      checkInDate: "2024-06-01",
      checkOutDate: "2024-06-04",
    }, actor);

    expect(mockCalendarClient.reserveSlot).toHaveBeenCalledWith({
      listingId: "listing-1",
      bookingId: "test-uuid-123",
      checkIn: "2024-06-01",
      checkOut: "2024-06-04",
    });
  });
});
