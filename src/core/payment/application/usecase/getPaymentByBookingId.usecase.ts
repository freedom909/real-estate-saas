import { PaymentRepository } from "@/core/payment/infra/repository/payment.repository";
import { TOKENS_PAYMENT } from "@/modules/tokens/payment.tokens";
import { inject, injectable } from "tsyringe";
import { Payment } from "../../domain/entity/payment.entity";

@injectable()

export class GetPaymentByBookingIdUseCase {

    constructor(

        @inject(TOKENS_PAYMENT.repos.paymentRepository)

        private paymentRepository: PaymentRepository

    ) {}

    async execute(bookingId: string): Promise<Payment | null> {
        return this.paymentRepository.findByBookingId(bookingId);
    }

}