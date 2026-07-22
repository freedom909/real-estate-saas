import { gql } from "@apollo/client";

export const CHECK_IN_BOOKING = gql`
mutation CheckInBooking($id: ID!) {
  checkInBooking(id: $id) {
    id
    status
    price
    checkInDate
    checkOutDate
  }
}
`;
