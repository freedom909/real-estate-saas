import { TOKENS_PAYMENT } from "@/modules/tokens/payment.tokens";
import { inject, injectable } from "tsyringe";
import { IPaymentRepository } from "../../domain/repository/i-payment.repository";
import { Payment } from "../../domain/entity/payment.entity";

@injectable()
export class GetPaymentsByCustomerUseCase {
  constructor(
    @inject(TOKENS_PAYMENT.repos.paymentRepository)
    private paymentRepository: IPaymentRepository,
  ) {}

  async execute(customerId: string): Promise<Payment[]> {
    return this.paymentRepository.findByCustomerId(customerId);
  }
}
