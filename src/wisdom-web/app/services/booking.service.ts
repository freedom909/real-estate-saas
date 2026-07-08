// src/wisdom-web/app/services/booking.service.ts
//import { Booking } from "@/graphql/generated";
import axios from "axios";
import client from "../lib/apolloClient";
const API_URL = "/4000/graphql/bookings";

export interface Booking {
    listingId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
}
export async function createBooking(input: CreateBookingInput) {
    const { data } = await client.mutate({
        mutation: CREATE_BOOKING,
        variables: {
            input,
        },
    });

    return data?.createBooking;
}


export async function cancelBooking(bookingId: string) {
    const { data } = await client.mutate({
        mutation: CANCEL_BOOKING,
        variables: {
            bookingId,
        },
    });

    return data?.cancelBooking;
}

export async function getBookings() {
    const { data } = await client.query({
        query: GET_BOOKINGS,
    });

    return data?.bookings || [];
}
