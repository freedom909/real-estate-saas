"use client";

import { gql, useQuery } from "@apollo/client";

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
picture
price
}

}

}

`;