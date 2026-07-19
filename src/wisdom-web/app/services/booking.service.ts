// src/wisdom-web/app/services/booking.service.ts
//import { Booking } from "@/graphql/generated";
import axios from "axios";
import {client }from "../lib/apolloClient";
import { CreateBookingInput } from "app/types/booking.types";
import { CREATE_BOOKING } from "app/graphql/booking/mutations/createBooking";
import { GET_BOOKINGS } from "app/graphql/booking/queries/bookinsForCustomer.ts";
import { CANCEL_BOOKING } from "app/graphql/booking/mutations/cancelBooking";

const API_URL = "/4000/graphql/bookings";


export interface Booking {
    listingId: string;
    checkIn: string;
    checkOut: string;
    customers: number;
}
export async function createBooking(input: CreateBookingInput) {
     const { data } = await client.mutate({
        mutation: CREATE_BOOKING,
        variables: {
            input,
        },
    });

    return (data as any)?.createBooking;
}


export async function cancelBooking(bookingId: string) {
    const { data } = await client.mutate({
        mutation: CANCEL_BOOKING,
        variables: {
            id: bookingId,
        },
    });

    return (data as any)?.cancelBooking;
}

export async function getBookings() {
    const { data } = await client.query({
        query: GET_BOOKINGS,
    });

    return (data as any)?.bookingsForCustomer || [];
}
