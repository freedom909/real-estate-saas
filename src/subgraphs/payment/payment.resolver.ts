import { CancelPaymentUseCase } from "@/core/payment/application/usecase/cancel-payment.usecase";
import { CreatePaymentUseCase } from "@/core/payment/application/usecase/create-payment.usecase";
import { ProcessPaymentUseCase } from "@/core/payment/application/usecase/process-payment.usecase";
import { RefundPaymentUseCase } from "@/core/payment/application/usecase/refund-payment.usecase";
import { PaymentRepository } from "@/core/payment/infra/repository/payment.repositoy";
import { TOKENS_PAYMENT } from "@/modules/tokens/payment.tokens";
import { container } from "tsyringe";


const resolvers = {
 Query: {

    payment: async (
      _: any,
      { id }: any
    ) => {

      const repo =
        container.resolve<PaymentRepository>(
          TOKENS_PAYMENT.repos.paymentRepository
        );

      return repo.findById(id);
    },
  },

  Mutation: {

    createPayment: async (
      _: any,
      { input }: any
    ) => {

      return container
        .resolve<CreatePaymentUseCase>(
          TOKENS_PAYMENT.usecase
            .createPaymentUseCase
        )
        .execute(input);
    },

    processPayment: async (
      _: any,
      { paymentId }: any
    ) => {

      return container.resolve<ProcessPaymentUseCase>(TOKENS_PAYMENT.usecase.processPaymentUseCase).execute(paymentId);
    },

    refundPayment: async (
      _: any,
      { paymentId }: any
    ) => {

      return container
        .resolve<RefundPaymentUseCase>(
          TOKENS_PAYMENT.usecase
            .refundPaymentUseCase
        )
        .execute(paymentId);
    },

    cancelPayment: async (
      _: any,
      { paymentId, reason }: any,
      
    ) => {

      return container
        .resolve<CancelPaymentUseCase>(TOKENS_PAYMENT.usecase.cancelPaymentUseCase)
        .execute(paymentId, reason);
    },
  },
};

export default resolvers;