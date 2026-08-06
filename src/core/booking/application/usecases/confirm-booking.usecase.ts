//src/subgraphs/booking/application/usecases/confirm-booking.usecase.ts

import { inject, injectable } from "tsyringe";
import { v4 as uuidv4 } from "uuid";

import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { TOKENS_PAYMENT } from "@/modules/tokens/payment.tokens";

import { IBookingRepository } from "../../domain/repositories/i-booking.repository";
import { TOKENS_EVENT_BUS } from "@/modules/tokens/event.bus.token";
import { IEventBus } from "@/shared/eventbus/IEventBus";
import { BookingConfirmedEvent } from "../../domain/events/booking-confirm.event";
import { IPaymentRepository } from "@/core/payment/domain/repository/i-payment.repository";
import { Payment, PaymentProvider } from "@/core/payment/domain/entity/payment.entity";

@injectable()
export class ConfirmBookingUseCase {
  constructor(
    @inject(TOKENS_BOOKING.repository.bookingRepository)// is this one OK?
    private bookingRepository: IBookingRepository,

    @inject(TOKENS_PAYMENT.repos.paymentRepository)
    private paymentRepository: IPaymentRepository,

    @inject(TOKENS_EVENT_BUS.eventBus)
    private eventBus: IEventBus,
  ) {}

async execute(id: string) {
    console.log(
    "[ConfirmBooking] start",
    id
  );
  const booking = await this.bookingRepository.findById(id);

  if (!booking) {
    throw new Error("Booking not found");
  }
  console.log(
    "[ConfirmBooking] before:",
    booking?.status
  );
    booking.confirm();
      console.log(
    "[ConfirmBooking] after:",
    booking.status
  );
    await this.bookingRepository.save(booking);
console.log(
  "[Payment] checking existing payment",
  booking.id
);
    const existingPayment = await this.paymentRepository.findByBookingId(booking.id);
console.log(
  "[Payment] existing:",
  existingPayment
);
    if (!existingPayment) {
       console.log(
   "[Payment] creating payment"
 );
      const payment = Payment.create({
        id: uuidv4(),
        bookingId: booking.id,
        customerId: booking.customerId,
        paymentProvider:PaymentProvider.MOCK,
        transactionId:`transaction_${uuidv4()}`,
        tenantId: booking.tenantId,
        dateRange: booking.dateRange,
        amount: booking.price,
      });

try {
  await this.paymentRepository.save(payment);

  console.log(
    "[Payment] saved successfully"
  );

} catch(error) {

  console.error(
    "[Payment] save failed",
    error
  );

  throw error;
}

    await this.eventBus.publish(
      new BookingConfirmedEvent(
        booking.id,
        booking.customerId,
        booking.tenantId,      
        booking.listingId,
        booking.price,
        booking.dateRange.checkInDate,
        booking.dateRange.checkOutDate,
        new Date()
      )
    );

    return booking;
  }
}}
