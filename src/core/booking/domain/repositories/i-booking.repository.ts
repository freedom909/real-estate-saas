import { Booking } from "../entities/booking.entity";

export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>;
  save(booking: Booking): Promise<void>;
  findByGuestId(guestId: string): Promise<Booking[]>;
  delete(id: string): Promise<void>;
  findByLatestByGuestId(guestId: string): Promise<Booking | null>;

}