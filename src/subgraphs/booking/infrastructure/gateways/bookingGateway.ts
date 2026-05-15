//src/subgraphs/booking/infrastructure/gateways/bookingGateway.ts

export interface BookingGateway {
  findById(id: string): Promise<Booking | null>;
}

export interface BookingRepository {
  findById(id: string): Promise<Booking | null>;
  update(booking: Booking): Promise<void>;
}

export interface Booking {
  id: string;
  status: BookingStatus;
}

export type BookingStatus = | "PENDING"| "UPCOMING" | "CONFIRMED" | "CANCELLED";