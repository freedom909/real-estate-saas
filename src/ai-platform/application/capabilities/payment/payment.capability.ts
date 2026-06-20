import { delay, inject, injectable } from "tsyringe";
import { CreatePaymentUseCase } from "@/core/payment/application/usecase/create-payment.usecase";
import { RefundPaymentUseCase } from "@/core/payment/application/usecase/refund-payment.usecase";

@injectable()
export class ProcessPaymentCapability {
  constructor(
    @inject(delay(() => CreatePaymentUseCase))
    private createPaymentUseCase: CreatePaymentUseCase
  ) {}

  async execute(input: any) {
    return this.createPaymentUseCase.execute(input);
  }
}

@injectable()
export class CreateRefundCapability {
  constructor(
    @inject(delay(() => RefundPaymentUseCase))
    private refundPaymentUseCase: RefundPaymentUseCase
  ) {}

  async execute(paymentId: string) {
    return this.refundPaymentUseCase.execute(paymentId);
  }
}
