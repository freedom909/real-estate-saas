"use client";

import { gql } from "@apollo/client";

export const BOOKINGS_FOR_CUSTOMER = gql`
  query BookingsForCustomer($userId: ID!) {
    bookingsForCustomer(userId: $userId) {
      id
      status
      checkInDate
      checkOutDate
      price
      listing {
        id
        title
        picture
        price
      }
    }
  }
`;

export const MY_BOOKINGS = gql`
  query MyBookings {
    myBookings {
      id
      status
      checkInDate
      checkOutDate
      price
      listing {
        id
        title
        picture
        price
      }
    }
  }
`;
