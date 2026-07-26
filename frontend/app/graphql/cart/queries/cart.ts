import { gql } from "@apollo/client";

export const GET_CARTS_BY_CUSTOMER = gql`
  query GetCartsByCustomer($customerId: ID!) {
    getCartsByCustomer(customerId: $customerId) {
      id
      customerId
      price
      checkInDate
      checkOutDate
      cartItems {
        id
        cartId
        listingId
        quantity
        price
        checkInDate
        checkOutDate
      }
    }
  }
`;

export const GET_CART = gql`
  query GetCart($cartId: ID!) {
    getCart(cartId: $cartId) {
      id
      customerId
      price
      checkInDate
      checkOutDate
      cartItems {
        id
        cartId
        listingId
        quantity
        price
        checkInDate
        checkOutDate
      }
    }
  }
`;
