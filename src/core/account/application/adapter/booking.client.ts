// src/core/account/application/adapter/booking.client.ts

import { BookingExternalDTO } from "@/core/booking/bookingDTO";
import axios from "axios";
import { injectable } from "tsyringe";

@injectable()

export class BookingClient {

    private endpoint = "http://localhost:4030/graphql";

    async fetchBookingData(userId: string): Promise<BookingExternalDTO[]> {

        const query = `

query GetBookings($userId: ID!) {

bookingsForCustomer(userId: $userId) {

id

customerId

price

status

createdAt

}

}

`;

        const response = await axios.post(this.endpoint, {

            query,

            variables: { userId },

        });

        return response.data.data.bookingsForCustomer;

    }

}