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
        price
        checkInDate
        checkOutDate
        cartItems {
          id
          listingId
          quantity
          price
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
        price
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
        price
        cartItems {
          id
          cartId
          listingId
          quantity
          price
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
        price
        cartItems {
          id
          cartId
          listingId
          quantity
          price
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
        price
        cartItems {
          id
          listingId
        }
      }
    }
  }
`;
