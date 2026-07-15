"use client";

import { gql, useQuery } from "@apollo/client";

export const MY_BOOKINGS = gql`

query MyBookings {

myBookings {

id

status

price

checkInDate

checkOutDate

listing {

title

picture

}

}

}

`;