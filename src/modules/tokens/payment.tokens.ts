export const TOKENS_PAYMENT = {
    repos: {
        paymentRepository: Symbol.for("PaymentRepository")
    },

    usecase: {
        createPaymentUseCase:
            Symbol.for("CreatePaymentUseCase"),

        processPaymentUseCase:
            Symbol.for("ProcessPaymentUseCase"),

        refundPaymentUseCase:
            Symbol.for("RefundPaymentUseCase"),

        cancelPaymentUseCase:
            Symbol.for("CancelPaymentUseCase"),
        confirmPaymentUseCase:
            Symbol.for("ConfirmPaymentUseCase"),
        getPaymentByBookingIdUseCase:
            Symbol.for("GetPaymentByBookingIdUseCase"),
        getPaymentsByCustomerUseCase:
            Symbol.for("GetPaymentsByCustomerUseCase"),
        failPaymentUseCase:
            Symbol.for("FailPaymentUseCase"),
    },
    event: {
        paymentMQEventBus: Symbol.for("PaymentMQEventBus")
    }
}
