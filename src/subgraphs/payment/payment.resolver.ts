import { CancelPaymentUseCase } from "@/core/payment/application/usecase/cancel-payment.usecase";
import { CreatePaymentUseCase } from "@/core/payment/application/usecase/create-payment.usecase";
import { ProcessPaymentUseCase } from "@/core/payment/application/usecase/process-payment.usecase";
import { RefundPaymentUseCase } from "@/core/payment/application/usecase/refund-payment.usecase";
import { ConfirmPaymentUseCase } from "@/core/payment/application/usecase/confirm-payment.usecase";
import { PaymentRepository } from "@/core/payment/infra/repository/payment.repository";
import { TOKENS_PAYMENT } from "@/modules/tokens/payment.tokens";
import { container } from "tsyringe";
import { GetPaymentByBookingIdUseCase } from "@/core/payment/application/usecase/getPaymentByBookingId.usecase";
import { GetPaymentsByCustomerUseCase } from "@/core/payment/application/usecase/getPaymentsByCustomer.usecase";
import { FailPaymentUseCase } from "@/core/payment/application/usecase/fail-payment.usecase";


const resolvers = {
  Query: {
    paymentByBooking: async (
      _: any,
      { bookingId }: any
    ) => {
      const useCase = container.resolve<GetPaymentByBookingIdUseCase>(TOKENS_PAYMENT.usecase.getPaymentByBookingIdUseCase);
      return useCase.execute(bookingId);
    },

    payment: async (
      _: any,
      { id }: any
    ) => {

      const repo = container.resolve<PaymentRepository>(
          TOKENS_PAYMENT.repos.paymentRepository
        );

      return repo.findById(id);
    },

    paymentsByCustomer: async (
      _: any,
      { customerId }: any
    ) => {
      const useCase = container.resolve<GetPaymentsByCustomerUseCase>(
        TOKENS_PAYMENT.usecase.getPaymentsByCustomerUseCase
      );
      return useCase.execute(customerId);
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

      return payment
   
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
        refundAmount: payment.amount
      }
    },

    cancelPayment: async (
      _: any,
      { paymentId, reason }: any,
    ) => {
      const payment = await container
        .resolve<CancelPaymentUseCase>(TOKENS_PAYMENT.usecase.cancelPaymentUseCase)
        .execute(paymentId, reason);

      return payment
    },

    confirmPayment: async (
      _: any,
      { paymentId }: any
    ) => {
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
    },

    failPayment: async (
      _: any,
      { paymentId }: any
    ) => {
      const payment = await container
        .resolve<FailPaymentUseCase>(
          TOKENS_PAYMENT.usecase.failPaymentUseCase
        )
        .execute(paymentId);

      return {
        code: 200,
        success: true,
        message: "Payment marked as failed",
        payment,
      };
    },
  },

  Booking: {

    payment: async (booking: any, _: any, context: any) => {
      if (!booking.id) {
        return null;
      }
      const paymentUseCase = container.resolve<GetPaymentByBookingIdUseCase>(TOKENS_PAYMENT.usecase.getPaymentByBookingIdUseCase);
      return paymentUseCase.execute(booking.id);
    }
  },
};

export default resolvers;