// BookingContext — the data needed to evaluate business rules against a booking
export interface BookingContext {
  bookingId: string;
  listingId: string;
  customerId: string;
  tenantId: string;
  checkInDate: Date;
  checkOutDate: Date;
  nightlyPrice: number;
  totalPrice: number;
  customerCount: number;
  numRooms: number;
  status: string;
  createdAt: Date;
  cancelledAt?: Date;
  confirmedAt?: Date;
}

export function createBookingContext(raw: Partial<BookingContext>): BookingContext {
  if (!raw.bookingId) throw new Error("bookingId is required");
  if (!raw.listingId) throw new Error("listingId is required");
  if (!raw.customerId) throw new Error("customerId is required");
  return {
    bookingId: raw.bookingId,
    listingId: raw.listingId,
    customerId: raw.customerId,
    tenantId: raw.tenantId ?? "",
    checkInDate: new Date(raw.checkInDate ?? Date.now()),
    checkOutDate: new Date(raw.checkOutDate ?? Date.now()),
    nightlyPrice: raw.nightlyPrice ?? 0,
    totalPrice: raw.totalPrice ?? 0,
    customerCount: raw.customerCount ?? 1,
    numRooms: raw.numRooms ?? 1,
    status: raw.status ?? "PENDING",
    createdAt: new Date(raw.createdAt ?? Date.now()),
    cancelledAt: raw.cancelledAt,
    confirmedAt: raw.confirmedAt,
  };
}
