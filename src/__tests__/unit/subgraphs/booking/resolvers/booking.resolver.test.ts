import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// Mock tokens
jest.mock("@/modules/tokens/booking.tokens", () => ({
  TOKENS_BOOKING: {
    repository: { bookingRepository: Symbol.for("BookingRepository") },
    usecase: {
      getBookingUseCase: Symbol.for("GetBookingUseCase"),
      cancelBookingUseCase: Symbol.for("CancelBookingUseCase"),
      confirmBookingUseCase: Symbol.for("ConfirmBookingUseCase"),
      createBookingUseCase: Symbol.for("CreateBookingUseCase"),
      completeBookingUseCase: Symbol.for("CompleteBookingUseCase"),
      updateBookingUseCase: Symbol.for("UpdateBookingUseCase"),
      checkInBookingUseCase: Symbol.for("CheckInBookingUseCase"),
    },
  },
}));

jest.mock("@/modules/tokens/event.bus.token", () => ({
  TOKENS_EVENT_BUS: { eventBus: Symbol.for("EventBus") },
}));

jest.mock("@/modules/tokens/calendar.tokens", () => ({
  TOKENS_CALENDAR: {
    usecase: {
      releaseSlotUseCase: Symbol.for("ReleaseSlotUseCase"),
      reserveSlotUseCase: Symbol.for("ReserveSlotUseCase"),
    },
  },
}));

jest.mock("tsyringe", () => ({
  container: {
    resolve: jest.fn(),
  },
}));

jest.mock("@/infrastructure/auth/require.auth", () => ({
  requireAuth: jest.fn(),
}));

// Mock withAuthorization to pass through directly to resolver
// This lets us test the resolver logic without the RBAC layer
jest.mock("@/infrastructure/auth/withAuthorization", () => ({
  withAuthorization: jest.fn(
    (_action: any, _resource: any, resolverFn: any, _options?: any) =>
      resolverFn
  ),
}));

const mockListingModel = {
  findAll: jest.fn(),
};
jest.mock("@/core/listing/infrastructure/models/listing.model", () => {
  return {
    __esModule: true,
    default: mockListingModel,
  };
});

import { resolvers } from "@/subgraphs/booking/resolvers";
import { container } from "tsyringe";
import { requireAuth } from "@/infrastructure/auth/require.auth";

describe("Booking Resolvers", () => {
  let mockBookingRepo: any;
  let mockGetBookingUseCase: any;
  let mockCancelBookingUseCase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockBookingRepo = {
      findById: jest.fn(),
      save: jest.fn(),
      findByCustomerId: jest.fn(),
      findByListingIds: jest.fn(),
      findAll: jest.fn(),
    };
    mockGetBookingUseCase = { execute: jest.fn() };
    mockCancelBookingUseCase = { execute: jest.fn() };

    (container.resolve as jest.Mock).mockImplementation((token: symbol) => {
      if (token === Symbol.for("BookingRepository")) return mockBookingRepo;
      if (token === Symbol.for("GetBookingUseCase")) return mockGetBookingUseCase;
      if (token === Symbol.for("CancelBookingUseCase")) return mockCancelBookingUseCase;
      return null;
    });
  });

  describe("cancelBooking resolver", () => {
    it("should call cancelBookingUseCase with correct args", async () => {
      const mockBooking = {
        id: "booking-1",
        listingId: "listing-1",
        customerId: "customer-1",
        status: "CONFIRMED",
      };
      mockCancelBookingUseCase.execute.mockResolvedValue({ ...mockBooking, status: "CANCELLED" });

      const context = {
        user: { userId: "customer-1", role: "CUSTOMER" },
      };

      const result = await (resolvers as any).Mutation.cancelBooking(
        null,
        { id: "booking-1", reason: "change of plans" },
        context
      );

      expect(mockCancelBookingUseCase.execute).toHaveBeenCalledWith("booking-1", "change of plans");
      expect(result.success).toBe(true);
      expect(result.booking.status).toBe("CANCELLED");
    });
  });

  describe("booking query", () => {
    it("should return a booking by ID", async () => {
      const mockBooking = { id: "booking-1", status: "CONFIRMED" };
      mockGetBookingUseCase.execute.mockResolvedValue(mockBooking);

      const result = await (resolvers as any).Query.booking(null, { id: "booking-1" });

      expect(mockGetBookingUseCase.execute).toHaveBeenCalledWith("booking-1");
      expect(result).toEqual(mockBooking);
    });

    it("should return null when booking not found", async () => {
      mockGetBookingUseCase.execute.mockResolvedValue(null);

      const result = await (resolvers as any).Query.booking(null, { id: "missing" });

      expect(result).toBeNull();
    });
  });

  describe("myBookings query", () => {
    it("should return customer's own bookings", async () => {
      const mockBookings = [
        { id: "booking-1", customerId: "customer-1" },
        { id: "booking-2", customerId: "customer-1" },
      ];
      (requireAuth as jest.Mock).mockResolvedValue({
        userId: "customer-1",
        role: "CUSTOMER",
      });
      mockBookingRepo.findByCustomerId.mockResolvedValue(mockBookings);

      const result = await (resolvers as any).Query.myBookings(
        null,
        {},
        { user: { userId: "customer-1", role: "CUSTOMER" } }
      );

      expect(result).toEqual(mockBookings);
    });

    it("should return host's listings bookings + own bookings", async () => {
      const ownerBookings = [{ id: "booking-1", customerId: "guest-1" }];
      const customerBookings = [{ id: "booking-2", customerId: "host-1" }];
      (requireAuth as jest.Mock).mockResolvedValue({
        userId: "host-1",
        role: "HOST",
      });
      mockListingModel.findAll.mockResolvedValue([
        { id: "listing-1" },
        { id: "listing-2" },
      ]);
      mockBookingRepo.findByListingIds.mockResolvedValue(ownerBookings);
      mockBookingRepo.findByCustomerId.mockResolvedValue(customerBookings);

      const result = await (resolvers as any).Query.myBookings(
        null,
        {},
        { user: { userId: "host-1", role: "HOST" } }
      );

      expect(result).toHaveLength(2);
      expect(mockListingModel.findAll).toHaveBeenCalledWith({
        where: { ownerId: "host-1" },
        attributes: ["id"],
      });
    });

    it("should return all bookings for admin", async () => {
      const allBookings = [
        { id: "booking-1" },
        { id: "booking-2" },
        { id: "booking-3" },
      ];
      (requireAuth as jest.Mock).mockResolvedValue({
        userId: "admin-1",
        role: "ADMIN",
      });
      mockBookingRepo.findAll.mockResolvedValue({ items: allBookings });

      const result = await (resolvers as any).Query.myBookings(
        null,
        {},
        { user: { userId: "admin-1", role: "ADMIN" } }
      );

      expect(result).toEqual(allBookings);
      expect(mockBookingRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 1000 });
    });

    it("should deduplicate bookings when host is also a customer", async () => {
      const sharedBooking = { id: "booking-1", customerId: "host-1" };
      const ownerBookings = [sharedBooking];
      const customerBookings = [sharedBooking, { id: "booking-2", customerId: "host-1" }];
      (requireAuth as jest.Mock).mockResolvedValue({
        userId: "host-1",
        role: "HOST",
      });
      mockListingModel.findAll.mockResolvedValue([{ id: "listing-1" }]);
      mockBookingRepo.findByListingIds.mockResolvedValue(ownerBookings);
      mockBookingRepo.findByCustomerId.mockResolvedValue(customerBookings);

      const result = await (resolvers as any).Query.myBookings(
        null,
        {},
        { user: { userId: "host-1", role: "HOST" } }
      );

      // Should deduplicate booking-1
      expect(result).toHaveLength(2);
      const ids = result.map((b: any) => b.id);
      expect(ids.filter((id: string) => id === "booking-1")).toHaveLength(1);
    });
  });
});
