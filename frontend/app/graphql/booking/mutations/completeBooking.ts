import { gql } from "@apollo/client";

export const COMPLETE_BOOKING = gql`
mutation CompleteBooking($id: ID!) {
  completeBooking(id: $id) {
    id
    status
    pricePerNight
    checkInDate
    checkOutDate
  }
}
`;
