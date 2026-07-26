import { gql } from "@apollo/client";

export const BOOKING_BY_ID = gql`
query BookingById($id: ID!) {
  booking(id: $id) {
    id
    status
    price
    checkInDate
    checkOutDate
    tenant {
      id
    }
    customer {
      id
    }
    listing {
      title
      picture
      price
    }
    payment {
      id
      status
      amount
    }
  }
}
`
