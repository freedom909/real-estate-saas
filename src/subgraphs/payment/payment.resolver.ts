import { CancelPaymentUseCase } from "@/core/payment/application/usecase/cancel-payment.usecase";
import { CreatePaymentUseCase } from "@/core/payment/application/usecase/create-payment.usecase";
import { ProcessPaymentUseCase } from "@/core/payment/application/usecase/process-payment.usecase";
import { RefundPaymentUseCase } from "@/core/payment/application/usecase/refund-payment.usecase";
import { ConfirmPaymentUseCase } from "@/core/payment/application/usecase/confirm-payment.usecase";
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

      const payment = await container
        .resolve<CreatePaymentUseCase>(
          TOKENS_PAYMENT.usecase
            .createPaymentUseCase
        )
        .execute(input);

      return {
        code: 200,
        success: true,
        message: "Payment created successfully",
        payment,
      };
    },

    processPayment: async (
      _: any,
      { paymentId }: any
    ) => {
      const payment = await container
        .resolve<ProcessPaymentUseCase>(TOKENS_PAYMENT.usecase.processPaymentUseCase)
        .execute(paymentId);

      return {
        code: 200,
        success: true,
        message: "Payment processing initiated",
        payment,
      };
    },

    processRefund: async (
      _: any,
      { input: { paymentId } }: any
    ) => {

      const payment = await container
        .resolve<RefundPaymentUseCase>(
          TOKENS_PAYMENT.usecase.refundPaymentUseCase
        )
        .execute(paymentId);

      return {
        code: 200,
        success: true,
        message: "Payment refund initiated",
        payment
      }
    },

    cancelPayment: async (
      _: any,
      { paymentId, reason }: any,
    ) => {
      const payment = await container
        .resolve<CancelPaymentUseCase>(TOKENS_PAYMENT.usecase.cancelPaymentUseCase)
        .execute(paymentId, reason);

      return {
        code: 200,
        success: true,
        message: "Payment cancelled successfully",
        payment,
      };
    },

    confirmPayment: async (
      _: any,
      { paymentId }: any
    ) => {

      console.log(
        "CONFIRM PAYMENT RESOLVER",
        paymentId
      );

      const payment =
        await container
          .resolve<ConfirmPaymentUseCase>(
            TOKENS_PAYMENT.usecase.confirmPaymentUseCase
          )
          .execute(paymentId);

      return {
        code: 200,
        success: true,
        message: "Payment confirmed",
        payment,
      };
    }
  },

  // Added Payment type resolver to handle domain field mapping
  Payment: {
    checkInDate: (parent: any) => parent.checkInDate || parent.dateRange?.checkInDate,
    checkOutDate: (parent: any) => parent.checkOutDate || parent.dateRange?.checkOutDate,
    booking: (parent: any) => ({ __typename: "Booking", id: parent.bookingId }),
    guest: (parent: any) => ({ __typename: "User", id: parent.guestId }),
  }
};

export default resolvers;