import { gql } from "@apollo/client";

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
