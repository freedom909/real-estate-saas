//src/core/booking/domain/service/booking-pricing.service.ts


import { DateRange } from "../value-objects/date-range.vo";

export class BookingPricingService {
  static calculatePrice(
    nightlyPrice: number,
    dateRange: DateRange
  ): number {

    if (
      !Number.isFinite(nightlyPrice) ||
      nightlyPrice < 0
    ) {
      throw new Error("Invalid nightly price");
    }

    return nightlyPrice * dateRange.nights;
  }
}

