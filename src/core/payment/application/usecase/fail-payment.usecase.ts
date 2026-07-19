import { TOKENS_PAYMENT } from "@/modules/tokens/payment.tokens";
import { inject, injectable } from "tsyringe";
import { IPaymentRepository } from "../../domain/repository/i-payment.repository";
import { TOKENS_EVENT_BUS } from "@/modules/tokens/event.bus.token";
import { IEventBus } from "@/shared/eventbus/IEventBus";
import { PaymentFailedEvent } from "../../domain/event/payment.failed.event";

@injectable()
export class FailPaymentUseCase {
  constructor(
    @inject(TOKENS_PAYMENT.repos.paymentRepository)
    private paymentRepository: IPaymentRepository,

    @inject(TOKENS_EVENT_BUS.eventBus)
    private eventBus: IEventBus,
  ) {}

  async execute(paymentId: string) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    payment.fail();

    await this.paymentRepository.save(payment);
    await this.eventBus.publish(
      new PaymentFailedEvent(
        payment.id,
        payment.bookingId,
        payment.customerId,
        payment.tenantId,
        payment.amount,
      )
    );

    return payment.toJSON();
  }
}
