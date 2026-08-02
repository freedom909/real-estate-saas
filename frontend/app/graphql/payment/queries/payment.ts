import { gql } from "@apollo/client";

export const GET_PAYMENTS_BY_CUSTOMER = gql`
  query GetPaymentsByCustomer($customerId: ID!) {
    paymentsByCustomer(customerId: $customerId) {
      id
      bookingId
      customerId
      tenantId
      amount
      status
      paymentIntentId
      createdAt
      updatedAt
    }
  }
`;

export const GET_PAYMENT = gql`
  query GetPayment($id: ID!) {
    payment(id: $id) {
      id
      bookingId
      customerId
      tenantId
      amount
      status
      paymentIntentId
      createdAt
      updatedAt
    }
  }
`;

export const GET_PAYMENT_BY_BOOKING = gql`
  query GetPaymentByBooking($bookingId: ID!) {
    paymentByBooking(bookingId: $bookingId) {
      id
      bookingId
      customerId
      tenantId
      amount
      status
      paymentIntentId
      createdAt
      updatedAt
    }
  }
`;
