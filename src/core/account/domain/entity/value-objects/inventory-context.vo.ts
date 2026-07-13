// InventoryContext — used by OversaleCheck and MultiRoomInventory rules
export interface InventoryContext {
  listingId: string;
  checkInDate: Date;
  checkOutDate: Date;
  numRooms: number;
  // Set by the rule after querying existing bookings
  existingBookings?: number;
  totalRooms?: number;
}

export interface InventoryCheckResult {
  available: boolean;
  existingBookings: number;
  totalRooms: number;
  requestedRooms: number;
  reason: string;
}

export interface OccupancyContext {
  listingId: string;
  checkInDate: Date;
  customerCount: number;
  maxOccupancy: number;  // numOfCustomers from the listing
}
