import { TOKENS_PAYMENT } from "@/modules/tokens/payment.tokens";
import { inject, injectable } from "tsyringe";
import { IPaymentRepository } from "../../domain/repository/i-payment.repository";
import { Payment } from "../../domain/entity/payemnt.entity";
import { v4 as uuidv4 } from "uuid";
import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { IBookingRepository } from "@/core/booking/domain/repositories/i-booking.repository";
import { TOKENS_EVENT_BUS } from "@/modules/tokens/event.bus.token";
//import { IEventBus } from "@/shared/eventbus/IEventBus";

@injectable()
export class CreatePaymentUseCase {

  constructor(
    @inject(TOKENS_PAYMENT.repos.paymentRepository)
    private paymentRepository: IPaymentRepository,

    @inject(TOKENS_BOOKING.repository.bookingRepository)
    private bookingRepository: IBookingRepository,
  ) {}

  async execute(input: {
    bookingId: string;
    guestId: string;
    tenantId: string;
    amount: number;
  }): Promise<Payment> {

    const booking =
      await this.bookingRepository.findById(
        input.bookingId
      );

    if (!booking) {
      throw new Error("Booking not found");
    }

    const existing =
      await this.paymentRepository
        .findByBookingId(input.bookingId);

    if (existing) {
      throw new Error(
        "Payment already exists"
      );
    }

    const payment =
      Payment.create({
        id: uuidv4(),
        bookingId: input.bookingId,
        guestId: input.guestId,
        tenantId: input.tenantId,
        dateRange: booking.dateRange,
        amount: input.amount,
      });

    await this.paymentRepository.save(
      payment
    );

    return payment;
  }
}