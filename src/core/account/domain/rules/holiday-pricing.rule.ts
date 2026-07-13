// Rule 2: 节假日价格
// HolidayPricingService — adds surcharge during peak/holiday dates
import { PricingContext, PricingBreakdown } from "../entity/value-objects/pricing-context.vo";

// Japanese national holidays + peak seasons (expandable)
const HOLIDAY_SURCHARGE_PERCENT = 30; // 30% surcharge on holidays

const JAPAN_HOLIDAYS_2025_2026: string[] = [
  // 2025
  "2025-01-01", "2025-01-02", "2025-01-03", // New Year
  "2025-01-13", // Coming of Age Day
  "2025-02-11", // National Foundation Day
  "2025-02-23", // Emperor's Birthday
  "2025-03-20", // Vernal Equinox
  "2025-04-29", "2025-05-03", "2025-05-04", "2025-05-05", // Golden Week
  "2025-07-21", // Marine Day
  "2025-08-11", // Mountain Day
  "2025-09-15", // Respect for the Aged Day
  "2025-09-23", // Autumnal Equinox
  "2025-10-13", // Sports Day
  "2025-11-03", // Culture Day
  "2025-11-23", // Labor Thanksgiving Day
  // 2026
  "2026-01-01", "2026-01-02", "2026-01-03",
  "2026-01-12", "2026-02-11", "2026-02-23",
  "2026-03-20", "2026-04-29", "2026-05-03", "2026-05-04", "2026-05-05",
];

function isHoliday(date: Date): boolean {
  const dateStr = date.toISOString().slice(0, 10);
  return JAPAN_HOLIDAYS_2025_2026.includes(dateStr);
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

export class HolidayPricingService {
  static readonly RULE_NAME = "HOLIDAY_PRICING";

  /**
   * Calculate night-by-night pricing with holiday/weekend surcharges.
   * Returns per-night breakdown.
   */
  static calculate(ctx: PricingContext): {
    nights: number;
    holidayNights: number;
    weekendNights: number;
    surcharge: number;
    nightPrices: Array<{ date: Date; basePrice: number; surcharge: number; finalPrice: number }>;
  } {
    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.ceil(
      (ctx.checkOutDate.getTime() - ctx.checkInDate.getTime()) / msPerDay
    );

    if (nights <= 0) {
      throw new Error("Invalid date range for holiday pricing");
    }

    let holidayNights = 0;
    let weekendNights = 0;
    let totalSurcharge = 0;
    const nightPrices: Array<{ date: Date; basePrice: number; surcharge: number; finalPrice: number }> = [];

    for (let i = 0; i < nights; i++) {
      const nightDate = new Date(ctx.checkInDate.getTime() + i * msPerDay);
      const base = ctx.nightlyPrice;
      let surcharge = 0;

      if (isHoliday(nightDate)) {
        surcharge = base * (HOLIDAY_SURCHARGE_PERCENT / 100);
        holidayNights++;
      } else if (isWeekend(nightDate)) {
        surcharge = base * 0.15; // 15% weekend surcharge
        weekendNights++;
      }

      totalSurcharge += surcharge;
      nightPrices.push({
        date: nightDate,
        basePrice: base,
        surcharge,
        finalPrice: base + surcharge,
      });
    }

    return { nights, holidayNights, weekendNights, surcharge: totalSurcharge, nightPrices };
  }
}
