import { gql } from "@apollo/client";

export const CREATE_BOOKING = gql`
mutation Mutation($input: CreateBookingInput!) {
  createBooking(input: $input) {
    success
    booking {
      checkInDate
      checkOutDate
    }
    code
  }
}
`;