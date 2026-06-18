import { TOKENS_PAYMENT } from "@/modules/tokens/payment.tokens";
import { inject, injectable } from "tsyringe";
import { IPaymentRepository } from "../../domain/repository/i-payment.repository";

@injectable()
export class ConfirmPaymentUseCase {
  constructor(
    @inject(TOKENS_PAYMENT.repos.paymentRepository)
    private paymentRepository: IPaymentRepository,
  ) {}

  async execute(paymentId: string) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    payment.succeed();
    await this.paymentRepository.save(payment);
    return payment.toJSON();
  }
}