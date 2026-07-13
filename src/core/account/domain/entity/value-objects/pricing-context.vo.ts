// PricingContext — used by HolidayPricing and CleaningFee rules
export interface PricingContext {
  listingId: string;
  checkInDate: Date;
  checkOutDate: Date;
  nightlyPrice: number;
  customerCount: number;
  numRooms: number;
  // Optional overrides
  cleaningFee?: number;
  holidaySurcharge?: number;
  couponDiscount?: number;
}

export interface PricingBreakdown {
  basePrice: number;        // nightlyPrice × nights
  cleaningFee: number;
  holidaySurcharge: number;
  couponDiscount: number;
  totalPrice: number;
}

export function createPricingContext(raw: Partial<PricingContext>): PricingContext {
  if (!raw.listingId) throw new Error("listingId is required");
  return {
    listingId: raw.listingId,
    checkInDate: new Date(raw.checkInDate ?? Date.now()),
    checkOutDate: new Date(raw.checkOutDate ?? Date.now()),
    nightlyPrice: raw.nightlyPrice ?? 0,
    customerCount: raw.customerCount ?? 1,
    numRooms: raw.numRooms ?? 1,
    cleaningFee: raw.cleaningFee,
    holidaySurcharge: raw.holidaySurcharge,
    couponDiscount: raw.couponDiscount,
  };
}
