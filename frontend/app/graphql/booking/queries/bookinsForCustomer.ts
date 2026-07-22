import { gql } from "@apollo/client";


// booking.queries.ts
export const GET_BOOKINGS = gql`
query BookingsForCustomer($userId: ID!) {
  bookingsForCustomer(userId: $userId) {
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