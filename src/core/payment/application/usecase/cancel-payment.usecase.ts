import { TOKENS_PAYMENT } from "@/modules/tokens/payment.tokens";
import { inject, injectable } from "tsyringe";
import { IPaymentRepository } from "../../domain/repository/i-payment.repository";
import { IEventBus } from "@/shared/eventbus/IEventBus";
import { TOKENS_EVENT_BUS } from "@/modules/tokens/event.bus.token";
import { PaymentCancelledEvent } from "../../domain/event/payment.cancel.event";

@injectable()
export class CancelPaymentUseCase {
    constructor(
        @inject(TOKENS_PAYMENT.repos.paymentRepository)
        private paymentRepository: IPaymentRepository,
        @inject(TOKENS_EVENT_BUS.eventBus)
        private eventBus: IEventBus,
    ) { }

    async execute(paymentId: string, reason: string) {
        const payment = await this.paymentRepository.findById(paymentId);
        if (!payment) {
            throw new Error("Payment not found");
        }
        payment.cancel(reason);
        await this.paymentRepository.save(payment);
        await this.eventBus.publish(
            new PaymentCancelledEvent(
                payment.id,
                payment.bookingId,
                payment.customerId,
                payment.tenantId,

                payment.amount,

                payment.checkInDate,
                payment.checkOutDate,

                reason
            )
        );
        return payment
    }
}