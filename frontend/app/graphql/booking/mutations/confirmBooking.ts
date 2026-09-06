import { gql } from "@apollo/client";

export const CONFIRM_BOOKING = gql`
mutation ConfirmBooking($id: ID!) {
  confirmBooking(id: $id) {
    id
    status
    pricePerNight
    checkInDate
    checkOutDate
  }
}
`;
