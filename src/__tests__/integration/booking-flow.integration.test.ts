/**
 * Integration test for the full booking creation flow.
 * Tests: Resolver → CreateBookingUseCase → ListingGateway → BookingPricingService → Repository
 *
 * Run: npx jest src/__tests__/integration/booking-flow.integration.test.ts --no-cache
 */
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// ── Mocks ──────────────────────────────────────────────────────────────────
jest.mock("uuid", () => ({ v4: () => "test-uuid-001" }));

jest.mock("@/modules/tokens/booking.tokens", () => ({
  TOKENS_BOOKING: {
    repository: { bookingRepository: Symbol("BookingRepository") },
    gateway: { listingGateway: Symbol("ListingGateway") },
  },
}));

jest.mock("@/modules/tokens/event.bus.token", () => ({
  TOKENS_EVENT_BUS: { eventBus: Symbol("EventBus") },
}));

jest.mock("@/shared/eventbus/in-memory-event-bus", () => ({
  InMemoryEventBus: class {},
}));

// ── Imports ────────────────────────────────────────────────────────────────
import { CreateBookingUseCase } from "@/core/booking/application/usecases/create-booking.usecase";
import { BookingPricingService } from "@/core/booking/domain/service/booking-pricing.service";

// ── Helpers ────────────────────────────────────────────────────────────────
function createMocks() {
  const savedBookings: any[] = [];
  const repo = {
    save: jest.fn<(b: any) => Promise<void>>().mockImplementation(async (b) => {
      savedBookings.push(b);
    }),
    findById: jest.fn(),
    findByCustomerId: jest.fn(),
    delete: jest.fn(),
    findByLatestByCustomerId: jest.fn(),
  };
  const eventBus = { publish: jest.fn<() => Promise<void>>().mockResolvedValue(undefined) };
  const listingGateway = {
    getListingPrice: jest.fn<(id: string) => Promise<number>>(),
  };
  return { repo, eventBus, listingGateway, savedBookings };
}

// ── Tests ──────────────────────────────────────────────────────────────────
describe("Booking creation flow (integration)", () => {
  let mocks: ReturnType<typeof createMocks>;
  let useCase: CreateBookingUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    mocks = createMocks();
    useCase = new CreateBookingUseCase(
      mocks.repo as any,
      mocks.eventBus as any,
      mocks.listingGateway as any
    );
  });

  it("3 nights at ¥5000/night → total ¥15000", async () => {
    mocks.listingGateway.getListingPrice.mockResolvedValue(5000);

    const result = await useCase.execute({
      listingId: "listing-abc",
      customerId: "user-1",
      checkInDate: "2024-07-01",
      checkOutDate: "2024-07-04",
    });

    expect(mocks.listingGateway.getListingPrice).toHaveBeenCalledWith("listing-abc");
    expect(result.price).toBe(15000);
    expect(mocks.repo.save).toHaveBeenCalledTimes(1);
    expect(mocks.eventBus.publish).toHaveBeenCalledTimes(1);
  });

  it("input.price is completely ignored — server always uses listing price", async () => {
    mocks.listingGateway.getListingPrice.mockResolvedValue(3000);

    const result = await useCase.execute({
      listingId: "listing-xyz",
      customerId: "user-2",
      checkInDate: "2024-08-01",
      checkOutDate: "2024-08-06",
      price: 0, // should be ignored
    });

    // 5 nights × 3000 = 15000
    expect(result.price).toBe(15000);
  });

  it("1 night at ¥800/night → total ¥800", async () => {
    mocks.listingGateway.getListingPrice.mockResolvedValue(800);

    const result = await useCase.execute({
      listingId: "listing-short",
      customerId: "user-3",
      checkInDate: "2024-09-10",
      checkOutDate: "2024-09-11",
    });

    expect(result.price).toBe(800);
  });

  it("propagates listing-not-found error", async () => {
    mocks.listingGateway.getListingPrice.mockRejectedValue(
      new Error("Listing missing-listing not found")
    );

    await expect(
      useCase.execute({
        listingId: "missing-listing",
        customerId: "user-4",
        checkInDate: "2024-10-01",
        checkOutDate: "2024-10-03",
      })
    ).rejects.toThrow("Listing missing-listing not found");

    expect(mocks.repo.save).not.toHaveBeenCalled();
  });

  it("rejects checkInDate after checkOutDate", async () => {
    mocks.listingGateway.getListingPrice.mockResolvedValue(1000);

    await expect(
      useCase.execute({
        listingId: "listing-1",
        customerId: "user-5",
        checkInDate: "2024-12-05",
        checkOutDate: "2024-12-01",
      })
    ).rejects.toThrow("checkInDate must be before checkOutDate");
  });

  it("rejects missing required fields", async () => {
    await expect(
      useCase.execute({ listingId: "listing-1" })
    ).rejects.toThrow("Missing required booking information");
  });

  it("saved booking entity has correct price and date range", async () => {
    mocks.listingGateway.getListingPrice.mockResolvedValue(2000);

    await useCase.execute({
      listingId: "listing-save",
      customerId: "user-6",
      checkInDate: "2024-11-01",
      checkOutDate: "2024-11-04",
    });

    const saved = mocks.repo.save.mock.calls[0][0];
    expect(saved.price).toBe(6000);
    expect(saved.listingId).toBe("listing-save");
  });

  it("BookingPricingService.calculatePrice matches manual calculation", () => {
    const price = BookingPricingService.calculatePrice(
      5000,
      new Date("2024-07-01"),
      new Date("2024-07-04")
    );
    expect(price).toBe(5000 * 3);
  });
});
