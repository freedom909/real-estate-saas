"use client";

import { gql} from "@apollo/client";

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
 pictures {
    objectKey
    sortOrder
  }
price
}

}

}

`;