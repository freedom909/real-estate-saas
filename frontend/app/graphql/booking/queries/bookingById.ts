// 查询指定ID的预订详情
//src/graphql/booking/queries/bookingById.ts

import { gql } from "@apollo/client";

export const BOOKING_BY_ID = gql`
query BookingById($id: ID!) {

booking(id: $id) {

id

status

price

checkInDate

checkOutDate

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

}`