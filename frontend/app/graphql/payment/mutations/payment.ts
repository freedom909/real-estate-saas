import { gql } from "@apollo/client";

export const CREATE_PAYMENT = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      id
      bookingId
      customerId
      tenantId
      amount
      status
      createdAt
    }
  }
`;

export const PROCESS_PAYMENT = gql`
  mutation ProcessPayment($paymentId: ID!) {
    processPayment(paymentId: $paymentId) {
      code
      success
      message
      payment {
        id
        status
        amount
      }
    }
  }
`;

export const CONFIRM_PAYMENT = gql`
  mutation ConfirmPayment($paymentId: ID!) {
    confirmPayment(paymentId: $paymentId) {
      code
      success
      message
      payment {
        id
        status
        amount
      }
    }
  }
`;

export const CANCEL_PAYMENT = gql`
  mutation CancelPayment($paymentId: ID!, $reason: String) {
    cancelPayment(paymentId: $paymentId, reason: $reason) {
      id
      status
      cancelReason
    }
  }
`;

export const PROCESS_REFUND = gql`
  mutation ProcessRefund($input: RefundInput!) {
    processRefund(input: $input) {
      code
      success
      message
      refundAmount
    }
  }
`;
