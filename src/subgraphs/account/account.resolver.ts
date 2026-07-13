// Account Subgraph Resolvers
import { container } from "tsyringe";
import { TOKENS_ACCOUNT } from "@/modules/tokens/account.token";

// Domain Services (Business Rules)
import { CancellationPolicyService } from "@/core/account/domain/rules/cancellation-policy.rule";
import { HolidayPricingService } from "@/core/account/domain/rules/holiday-pricing.rule";
import { CleaningFeeRuleService } from "@/core/account/domain/rules/cleaning-fee.rule";
import { OversaleCheckService } from "@/core/account/domain/rules/oversale-check.rule";
import { MultiRoomInventoryService } from "@/core/account/domain/rules/multi-room-inventory.rule";
import { CouponRuleService } from "@/core/account/domain/rules/coupon.rule";
import { RefundRuleService } from "@/core/account/domain/rules/refund.rule";
import { OccupancyLimitService } from "@/core/account/domain/rules/occupancy-limit.rule";
import { BookingValidationService } from "@/core/account/domain/rules/booking-validation.rule";

// Value objects
import { createBookingContext } from "@/core/account/domain/entity/value-objects/booking-context.vo";

// Use Cases
import { GetMyDashboardUseCase } from "@/core/account/application/usecase/get-my-dashboard.usecase";
import { BookingACL } from "@/core/account/infra/booking.acl";
import { ListingACL } from "@/core/account/infra/listing.acl";
import { ReviewACL } from "@/core/account/infra/review.acl";
import { TenantACL } from "@/core/account/infra/tenant.acl";

export const resolvers = {
  // =====================
  // Queries
  // =====================
  Query: {
    myDashboard: async (_: any, __: any, context: any) => {
      const userId = context.user?.userId || context.user?.id;
      if (!userId) {
        throw new Error("Unauthenticated: Please log in to view your dashboard");
      }
      const useCase = container.resolve<GetMyDashboardUseCase>(
        TOKENS_ACCOUNT.GetMyDashboardUseCase
      );
      return useCase.execute(userId);
    },

    // --- Business Rule Queries ---

    checkCancellationPolicy: (_: any, { input }: any) => {
      const cancelledAt = new Date();
      const ctx = {
        bookingId: input.bookingId || "check",
        listingId: "",
        customerId: "",
        tenantId: "",
        checkInDate: new Date(input.checkInDate),
        checkOutDate: new Date(input.checkInDate), // same day (we only need checkIn)
        nightlyPrice: 0,
        totalPrice: 0,
        customerCount: 1,
        numRooms: 1,
        status: "PENDING",
        createdAt: new Date(),
      };
      return CancellationPolicyService.evaluate(ctx, cancelledAt);
    },

    calculateHolidayPricing: (_: any, { input }: any) => {
      return HolidayPricingService.calculate({
        listingId: input.listingId,
        checkInDate: new Date(input.checkInDate),
        checkOutDate: new Date(input.checkOutDate),
        nightlyPrice: input.nightlyPrice,
        customerCount: input.customerCount ?? 1,
        numRooms: input.numRooms ?? 1,
      });
    },

    calculateCleaningFee: (_: any, { input }: any) => {
      return CleaningFeeRuleService.calculate({
        listingId: input.listingId,
        checkInDate: new Date(input.checkInDate),
        checkOutDate: new Date(input.checkOutDate),
        nightlyPrice: input.nightlyPrice,
        customerCount: input.customerCount,
        numRooms: input.numRooms ?? 1,
      });
    },

    checkOversale: (_: any, { input }: any) => {
      return OversaleCheckService.evaluate({
        listingId: input.listingId,
        checkInDate: new Date(input.checkInDate),
        checkOutDate: new Date(input.checkOutDate),
        numRooms: input.numRooms ?? 1,
        totalRooms: input.totalRooms,
        existingBookings: input.existingBookings,
      });
    },

    checkMultiRoomInventory: (_: any, { input }: any) => {
      return MultiRoomInventoryService.evaluate({
        listingId: input.listingId,
        checkInDate: new Date(input.checkInDate),
        checkOutDate: new Date(input.checkOutDate),
        numRooms: input.numRooms,
        totalRooms: input.totalRooms,
        existingBookings: input.existingBookings,
      });
    },

    validateCoupon: (_: any, { input }: any) => {
      // In production, couponRecord would be fetched from DB
      // For now, return validation with null record (will report "not found")
      return CouponRuleService.validate(
        {
          couponCode: input.couponCode,
          listingId: input.listingId,
          totalPrice: input.totalPrice,
          customerId: input.customerId,
          checkInDate: new Date(input.checkInDate),
          checkOutDate: new Date(input.checkOutDate),
        },
        null
      );
    },

    checkRefund: (_: any, { input }: any) => {
      return RefundRuleService.calculate({
        bookingId: input.bookingId,
        totalPrice: input.totalPrice,
        amountPaid: input.amountPaid,
        checkInDate: new Date(input.checkInDate),
        cancelledAt: new Date(input.cancelledAt),
        status: input.status,
      });
    },

    checkOccupancy: (_: any, { input }: any) => {
      return OccupancyLimitService.evaluate({
        listingId: input.listingId,
        checkInDate: new Date(input.checkInDate),
        customerCount: input.customerCount,
        maxOccupancy: input.maxOccupancy,
      });
    },

    validateBooking: (_: any, { input }: any) => {
      const results = BookingValidationService.validate(
        createBookingContext({
          bookingId: input.bookingId || "validation",
          listingId: input.listingId,
          customerId: input.customerId,
          tenantId: input.tenantId ?? "",
          checkInDate: input.checkInDate,
          checkOutDate: input.checkOutDate,
          nightlyPrice: input.nightlyPrice,
          totalPrice: input.totalPrice,
          customerCount: input.customerCount,
          status: input.status ?? "PENDING",
        }),
        input.dailyBookingCount ?? 0,
        input.maxDailyBookings ?? 3
      );
      return {
        results,
        allPassed: results.every((r: any) => r.passed),
      };
    },
  },

  // =====================
  // Mutations
  // =====================
  Mutation: {
    cancelBookingWithPolicy: async (_: any, { bookingId, checkInDate, totalPrice, amountPaid }: any, context: any) => {
      const userId = context.user?.userId || context.user?.id;

      // Evaluate cancellation policy
      const cancellationResult = CancellationPolicyService.evaluate(
        createBookingContext({
          bookingId,
          listingId: "",
          customerId: userId || "",
          checkInDate,
          checkOutDate: checkInDate,
          nightlyPrice: 0,
          totalPrice,
        }),
        new Date()
      );

      // Evaluate refund
      const refundResult = RefundRuleService.calculate({
        bookingId,
        totalPrice,
        amountPaid,
        checkInDate: new Date(checkInDate),
        cancelledAt: new Date(),
        status: "CANCELLED",
      });

      // Note: In production, this would also:
      // 1. Call the booking subgraph to actually cancel the booking
      // 2. Process the refund via payment service
      // For now, return the policy evaluation results

      return {
        code: 200,
        success: true,
        message: refundResult.eligible
          ? `Booking cancelled. Refund of ¥${refundResult.refundAmount} will be processed.`
          : `Booking cancelled. ${refundResult.reason}`,
        refundEligible: refundResult.eligible,
        refundAmount: refundResult.refundAmount,
        cancellationPolicy: cancellationResult,
      };
    },
  },

  // =====================
  // Federation Reference Resolvers
  // =====================
  User: {
    myBookings: async (parent: { id: string }) => {
      const acl = container.resolve<BookingACL>(TOKENS_ACCOUNT.BookingACL);
      return acl.getRawBookings(parent.id);
    },

    myListings: async (parent: { id: string }) => {
      const acl = container.resolve<ListingACL>(TOKENS_ACCOUNT.ListingACL);
      return acl.getListingsByOwner(parent.id);
    },

    myReviews: async (parent: { id: string }) => {
      const acl = container.resolve<ReviewACL>(TOKENS_ACCOUNT.ReviewACL);
      return acl.getReviewsByUser(parent.id);
    },

    // tenant: async (parent: { id: string }) => {
    //   const tenantACL = container.resolve<TenantACL>(TOKENS_ACCOUNT.TenantACL);
    //   const tenant = await tenantACL.getTenantByUserId(parent.id);
    //   if (!tenant) return null;
    //   return {
    //     __typename: "Tenant",
    //     id: tenant.id,
    //   };
    // }
    tenant: async () => null
  },
};
