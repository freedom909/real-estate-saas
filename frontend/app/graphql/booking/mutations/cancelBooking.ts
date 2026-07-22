import { gql } from "@apollo/client";

export const CANCEL_BOOKING = gql`
mutation CancelBooking($id: ID!) {
  cancelBooking(id: $id) {
    code
    success
    message
    booking {
      id
      status
      price
      checkInDate
      checkOutDate
    }
  }
}
`;
