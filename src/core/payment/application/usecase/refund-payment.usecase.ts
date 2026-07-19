import { TOKENS_PAYMENT } from "@/modules/tokens/payment.tokens";
import { inject, injectable } from "tsyringe";
import { IPaymentRepository } from "../../domain/repository/i-payment.repository";
import { TOKENS_EVENT_BUS } from "@/modules/tokens/event.bus.token";
import { IEventBus } from "@/shared/eventbus/IEventBus";
import { PaymentRefundedEvent } from "../../domain/event/payment.refund.event";

@injectable()
export class RefundPaymentUseCase {

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
    payment.refund();
    await this.paymentRepository.save(payment);
    await this.eventBus.publish(
      new PaymentRefundedEvent(
        payment.id,
        payment.bookingId,
        payment.customerId,
        payment.tenantId,
        payment.amount,
        payment.checkInDate,
        payment.checkOutDate,
        payment.refundedAt
      )
    );

    return payment.toJSON();
  }
}