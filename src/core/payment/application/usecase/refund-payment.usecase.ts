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
   console.log("REFUND START", paymentId);
    const payment =
      await this.paymentRepository.findById(paymentId);
      console.log(
    "FOUND PAYMENT",
    payment?.toJSON?.()
  );
    if (!payment) {
      throw new Error("Payment not found");
    }
  console.log(
    "STATUS BEFORE",
    payment.status
  );
    payment.refund();
  console.log(
    "STATUS AFTER",
    payment.status
  );
    await this.paymentRepository.save(payment);
 console.log("SAVE OK");
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