import { PaymentRepository } from "@/core/payment/infra/repository/payment.repositoy";
import { TOKENS_PAYMENT } from "../tokens/payment.tokens";
import { container } from "tsyringe";
import { RefundPaymentUseCase } from "@/core/payment/application/usecase/refund-payment.usecase";
import { CancelPaymentUseCase } from "@/core/payment/application/usecase/cancel-payment.usecase";
import { ProcessPaymentUseCase } from "@/core/payment/application/usecase/process-payment.usecase";
import { CreatePaymentUseCase } from "@/core/payment/application/usecase/create-payment.usecase";
import { ConfirmPaymentUseCase } from "@/core/payment/application/usecase/confirm-payment.usecase";

//
export const PaymentRegister = () => {

  container.register(
    TOKENS_PAYMENT.repos.paymentRepository,
    {
      useClass: PaymentRepository,
    }
  );

  container.register(
    TOKENS_PAYMENT.usecase.createPaymentUseCase,
    {
      useClass: CreatePaymentUseCase,
    }
  );

  container.register(
    TOKENS_PAYMENT.usecase.processPaymentUseCase,
    {
      useClass: ProcessPaymentUseCase,
    }
  );

  container.register(
    TOKENS_PAYMENT.usecase.refundPaymentUseCase,
    {
      useClass: RefundPaymentUseCase,
    }
  );

  container.register(
    TOKENS_PAYMENT.usecase.cancelPaymentUseCase,
    {
      useClass: CancelPaymentUseCase,
    }
  );

  container.register(
    TOKENS_PAYMENT.usecase.confirmPaymentUseCase,
    {
      useClass: ConfirmPaymentUseCase,
    }
  );


};