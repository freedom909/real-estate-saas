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
import { Payment } from "@/core/payment/domain/entity/payment.entity";

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
  const booking =
    await this.bookingRepository.findById(id);

  if (!booking) {
    throw new Error("Booking not found");
  }

    booking.confirm();
    await this.bookingRepository.save(booking);

    const existingPayment = await this.paymentRepository.findByBookingId(booking.id);

    if (!existingPayment) {
      const payment = Payment.create({
        id: uuidv4(),
        bookingId: booking.id,
        customerId: booking.customerId,
        tenantId: booking.tenantId,
        dateRange: booking.dateRange,
        amount: booking.price,
      });

      await this.paymentRepository.save(payment);
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
}
