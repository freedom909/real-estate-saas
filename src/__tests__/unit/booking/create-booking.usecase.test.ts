// FILE: src/__tests__/unit/booking/create-booking.usecase.test.ts


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
  TOKENS_EVENT_BUS: {
    eventBus: Symbol("EventBus"),
  },
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
  ReserveSlotUseCase: class {
    execute = jest.fn();
  },
}));

import { CreateBookingUseCase } from "@/core/booking/application/usecases/create-booking.usecase";

// ------------------------------------------------------
// Mocks
// ------------------------------------------------------

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
  getBookableListing: jest.fn<
    (listingId: string) => Promise<{
      id: string;
      tenantId: string;
      nightlyPrice: number;
      isActive: boolean;
    } | null>
  >(),
};

const mockCalendarClient = {
  reserveSlot: jest.fn<
    (input: {
      listingId: string;
      bookingId: string;
      checkIn: string;
      checkOut: string;
    }) => Promise<void>
  >().mockResolvedValue(undefined),

  releaseSlot: jest.fn<
    (input: {
      bookingId: string;
      reason: string;
    }) => Promise<void>
  >().mockResolvedValue(undefined),
};

// ------------------------------------------------------
// Test data
// ------------------------------------------------------

const actor = {
  customerId: "customer-1",
};

const validListing = {
  id: "listing-1",
  tenantId: "tenant-of-listing",
  nightlyPrice: 500,
  isActive: true,
};

const validInput = {
  listingId: "listing-1",
  checkInDate: "2024-06-01",
  checkOutDate: "2024-06-04",
};

// ------------------------------------------------------
// Tests
// ------------------------------------------------------

describe("CreateBookingUseCase", () => {
  let useCase: CreateBookingUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepo.save.mockResolvedValue(undefined);

    mockEventBus.publish.mockResolvedValue(undefined);

    mockListingGateway.getBookableListing.mockResolvedValue({
      ...validListing
    })

    mockCalendarClient.reserveSlot.mockResolvedValue(undefined);
    mockCalendarClient.releaseSlot.mockResolvedValue(undefined);

    useCase = new CreateBookingUseCase(
      mockRepo as any,
      mockEventBus as any,
      mockListingGateway as any,
      mockCalendarClient as any
    );
  });

  // ----------------------------------------------------
  // 1. Price calculation
  // ----------------------------------------------------

  it("should calculate price from listing nightly rate x nights", async () => {
    const result = await useCase.execute(validInput, actor);

    // 3 nights x 500 = 1500
    expect(result.price).toBe(1500);

    expect(
      mockListingGateway.getBookableListing
    ).toHaveBeenCalledWith("listing-1");
  });

  it("should always use listing price, not customer input", async () => {
    mockListingGateway.getBookableListing.mockResolvedValue({
      ...validListing,
      nightlyPrice: 800,
    });

    const result = await useCase.execute(
      {
        ...validInput,
        checkOutDate: "2024-06-03",
      },
      actor
    );

    // 2 nights x 800 = 1600
    expect(result.price).toBe(1600);
  });

  // ----------------------------------------------------
  // 2. Listing validation
  // ----------------------------------------------------

  it("should throw if listing is not found", async () => {
    mockListingGateway.getBookableListing.mockResolvedValue(null);

    await expect(
      useCase.execute(
        {
          ...validInput,
          listingId: "listing-999",
        },
        actor
      )
    ).rejects.toThrow("Listing not found");

    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it("should throw if listing has no tenant", async () => {
    mockListingGateway.getBookableListing.mockResolvedValue({
      ...validListing,
      tenantId: "",
    });

    await expect(
      useCase.execute(validInput, actor)
    ).rejects.toThrow("Listing has no tenant");

    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it("should throw if listing is inactive", async () => {
    mockListingGateway.getBookableListing.mockResolvedValue({
      ...validListing,
      isActive: false,
    });

    await expect(
      useCase.execute(validInput, actor)
    ).rejects.toThrow("Listing is not available for booking");

    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it("should throw if listing nightly price is invalid", async () => {
    mockListingGateway.getBookableListing.mockResolvedValue({
      ...validListing,
      nightlyPrice: Number.NaN,
    });

    await expect(
      useCase.execute(validInput, actor)
    ).rejects.toThrow("Invalid listing price");

    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it("should throw if listing nightly price is negative", async () => {
    mockListingGateway.getBookableListing.mockResolvedValue({
      ...validListing,
      nightlyPrice: -100,
    });

    await expect(
      useCase.execute(validInput, actor)
    ).rejects.toThrow("Invalid listing price");
  });

  // ----------------------------------------------------
  // 3. Date validation
  // ----------------------------------------------------

  it("should throw if checkInDate is after checkOutDate", async () => {
    await expect(
      useCase.execute(
        {
          ...validInput,
          checkInDate: "2024-06-05",
          checkOutDate: "2024-06-04",
        },
        actor
      )
    ).rejects.toThrow("Check-out must be after check-in");

    expect(
      mockListingGateway.getBookableListing
    ).not.toHaveBeenCalled();
  });

  it("should throw if checkInDate equals checkOutDate", async () => {
    await expect(
      useCase.execute(
        {
          ...validInput,
          checkInDate: "2024-06-04",
          checkOutDate: "2024-06-04",
        },
        actor
      )
    ).rejects.toThrow("Check-out must be after check-in");
  });

  it("should throw if date format is invalid", async () => {
    await expect(
      useCase.execute(
        {
          ...validInput,
          checkInDate: "2024/06/01",
        },
        actor
      )
    ).rejects.toThrow("Invalid date format");
  });

  it("should throw if calendar date is invalid", async () => {
    await expect(
      useCase.execute(
        {
          ...validInput,
          checkInDate: "2024-02-30",
        },
        actor
      )
    ).rejects.toThrow("Invalid calendar date");
  });

  // ----------------------------------------------------
  // 4. Required input and authentication
  // ----------------------------------------------------

  it("should throw if required fields are missing", async () => {
    await expect(
      useCase.execute(
        {
          listingId: "listing-1",
        } as any,
        actor
      )
    ).rejects.toThrow("Missing required booking information");
  });

  it("should throw if customerId is missing from actor", async () => {
    await expect(
      useCase.execute(
        validInput,
        {} as any
      )
    ).rejects.toThrow(
      "Missing required authentication: customerId"
    );
  });

  // ----------------------------------------------------
  // 5. Booking creation
  // ----------------------------------------------------

  it("should save booking and publish event", async () => {
    const result = await useCase.execute(validInput, actor);

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockEventBus.publish).toHaveBeenCalledTimes(1);

    expect(result).toBeDefined();
    expect(result.price).toBe(1500);
  });

  it("should assign booking to the listing's tenant", async () => {
    const result = await useCase.execute(validInput, actor);

    // Tenant ownership must come from Listing,
    // never from the customer's identity.
    expect(result.tenantId).toBe("tenant-of-listing");
  });

  it("should use the authenticated customerId", async () => {
    const result = await useCase.execute(validInput, actor);

    expect(result.customerId).toBe("customer-1");
  });

  // ----------------------------------------------------
  // 6. Calendar reservation
  // ----------------------------------------------------

  it("should reserve calendar slot on creation", async () => {
    await useCase.execute(validInput, actor);

    expect(mockCalendarClient.reserveSlot).toHaveBeenCalledWith({
  listingId: "listing-1",
  bookingId: "test-uuid-123",
  checkIn: "2024-06-01",
  checkOut: "2024-06-04",
});
  });

  it("should not save booking if calendar reservation fails", async () => {
    mockCalendarClient.reserveSlot.mockRejectedValue(
      new Error("Calendar service unavailable")
    );

    await expect(
      useCase.execute(validInput, actor)
    ).rejects.toThrow("Calendar service unavailable");

    expect(mockRepo.save).not.toHaveBeenCalled();

    // Reservation did not succeed, so no release is necessary.
    expect(mockCalendarClient.releaseSlot).not.toHaveBeenCalled();
  });

  it("should release calendar if booking save fails", async () => {
    mockRepo.save.mockRejectedValue(
      new Error("Database save failed")
    );

    await expect(
      useCase.execute(validInput, actor)
    ).rejects.toThrow("Database save failed");

    expect(mockCalendarClient.reserveSlot).toHaveBeenCalledTimes(1);

    expect(mockCalendarClient.releaseSlot).toHaveBeenCalledWith({
      bookingId: "test-uuid-123",
      reason: "Booking creation failed",
    });
  });

  // ----------------------------------------------------
  // 7. Event publishing failure
  // ----------------------------------------------------

  it("should keep saved booking if event publishing fails", async () => {
    mockEventBus.publish.mockRejectedValue(
      new Error("Event bus unavailable")
    );

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      const result = await useCase.execute(validInput, actor);

      expect(result).toBeDefined();
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      expect(mockEventBus.publish).toHaveBeenCalledTimes(1);

      // Booking was already saved, so calendar must NOT be released.
      expect(mockCalendarClient.releaseSlot).not.toHaveBeenCalled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
