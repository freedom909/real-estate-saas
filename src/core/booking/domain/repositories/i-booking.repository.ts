import { Booking } from "../entities/booking.entity";

export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>;
  save(booking: Booking): Promise<void>;
  findByCustomerId(customerId: string): Promise<Booking[]>;
  delete(id: string): Promise<void>;
  findByLatestByCustomerId(customerId: string): Promise<Booking | null>;

}