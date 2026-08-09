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
    id
    objectKey
    url
    mimeType
    size
    type
    sortOrder
}
price
}

}

}

`;