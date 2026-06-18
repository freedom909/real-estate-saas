// domain/repositories/i-payment.repository.ts

import { Payment } from "../entity/payemnt.entity";



export interface IPaymentRepository {

  findById(
    id: string
  ): Promise<Payment | null>;

  findByBookingId(
    bookingId: string
  ): Promise<Payment | null>;

  findByGuestId(
    guestId: string
  ): Promise<Payment[]>;

  save(
    payment: Payment
  ): Promise<void>;

  delete(
    id: string
  ): Promise<void>;
}