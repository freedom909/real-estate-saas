
import { TOKENS_PAYMENT } from "@/modules/tokens/payment.tokens";
import { inject, injectable } from "tsyringe";
import { IPaymentRepository } from "../../domain/repository/i-payment.repository";
import { BookingGateway } from "@/core/booking/bookingGateway";
import { TOKENS_EVENT_BUS } from "@/modules/tokens/event.bus.token";
import { IEventBus } from "@/shared/eventbus/IEventBus";
import { PaymentProcessedEvent } from "../../domain/event/payment.process.event";

//
@injectable()
export class ProcessPaymentUseCase {

  constructor(
    @inject(TOKENS_PAYMENT.repos.paymentRepository)
    private paymentRepository: IPaymentRepository,

    @inject(TOKENS_EVENT_BUS.eventBus)
    private eventBus: IEventBus,
  ) {}

  async execute(paymentId: string) {

    const payment =
      await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw new Error("Payment not found");
    }

    payment.process();

    await this.paymentRepository.save(payment);

    await this.eventBus.publish(
      new PaymentProcessedEvent(
        payment.id,
        payment.bookingId,
        payment.guestId,
        payment.tenantId,
        payment.amount,
        payment.checkInDate,
        payment.checkOutDate,
        payment.processedAt 
      )
    );

    return payment.toJSON();
  }
}