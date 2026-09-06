import { gql } from "@apollo/client";


// booking.queries.ts
export const GET_BOOKINGS = gql`
query BookingsForCustomer($userId: ID!) {
  bookingsForCustomer(userId: $userId) {
    checkInDate
    checkOutDate
    createdAt
    pricePerNight
    tenant {
      name
      owner {
pictures {
    id
    objectKey
    url
    mimeType
    size
    type
    sortOrder
}
      }
    }
  }
}
`;