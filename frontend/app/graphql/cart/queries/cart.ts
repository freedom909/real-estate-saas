import { gql } from "@apollo/client";

export const GET_CARTS_BY_CUSTOMER = gql`
  query GetCartsByCustomer($customerId: ID!) {
    getCartsByCustomer(customerId: $customerId) {
      id
      customerId
      pricePerNight
      checkInDate
      checkOutDate
      cartItems {
        id
        cartId
        listingId
        quantity
        pricePerNight
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
      pricePerNight
      checkInDate
      checkOutDate
      cartItems {
        id
        cartId
        listingId
        quantity
        pricePerNight
        checkInDate
        checkOutDate
      }
    }
  }
`;
