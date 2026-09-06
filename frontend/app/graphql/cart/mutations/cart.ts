import { gql } from "@apollo/client";

export const CREATE_CART = gql`
  mutation CreateCart($input: CreateCartInput!) {
    createCart(input: $input) {
      code
      success
      message
      cart {
        id
        customerId
        pricePerNight
        checkInDate
        checkOutDate
        cartItems {
          id
          listingId
          quantity
          pricePerNight
        }
      }
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      code
      success
      message
      cart {
        id
        customerId
        pricePerNight
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
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($input: UpdateCartItemInput!) {
    updateCartItem(input: $input) {
      code
      success
      message
      cart {
        id
        customerId
        pricePerNight
        cartItems {
          id
          cartId
          listingId
          quantity
          pricePerNight
        }
      }
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($input: RemoveFromCartInput!) {
    removeFromCart(input: $input) {
      code
      success
      message
      cart {
        id
        customerId
        pricePerNight
        cartItems {
          id
          cartId
          listingId
          quantity
          pricePerNight
        }
      }
    }
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart($cartId: ID!) {
    clearCart(cartId: $cartId) {
      code
      success
      message
      cart {
        id
        customerId
        pricePerNight
        cartItems {
          id
          listingId
        }
      }
    }
  }
`;
