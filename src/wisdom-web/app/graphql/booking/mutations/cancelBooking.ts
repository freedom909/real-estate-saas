// booking.mutations.ts
import { gql } from "@apollo/client";

// cancelBooking.mutation.ts
export const CANCEL_BOOKING = gql`
mutation CancelBooking($bookingId: ID!) {
  cancelBooking(bookingId: $bookingId) {
    checkInDate
    checkOutDate
    createdAt
    price
    tenant {
      name
      owner {
        picture
      }
    }
  }
}
`;