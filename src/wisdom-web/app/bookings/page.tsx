"use client";
import { useQuery } from "@apollo/client/react";
import { MY_BOOKINGS } from "app/graphql/booking/queries/myBookings";
import { BookingCard } from "./booking.card";
import Navbar from "app/components/navbar";


export default function MyBookingsPage() {

const { data, loading, error } = useQuery(MY_BOOKINGS);
    console.log("loading =", loading);

console.log("error =", error);

console.log("data =", data);
if (loading) return <div className="p-6">Loading...</div>;

if (error) {

const isUnauthenticated = error.message.includes("Unauthenticated");

if (isUnauthenticated) {

return (

<div className="flex min-h-[60vh] items-center justify-center">

<div className="text-center">

<h2 className="mb-2 text-2xl font-bold">Please login</h2>

<p className="mb-6 text-gray-600">

Please login to view your bookings.

</p>

<a

href="/login"

className="inline-block rounded-lg bg-black px-6 py-3 text-white"

>

Go to Login

</a>

</div>

</div>

);

}

return (

<div className="p-6 text-red-600">

Something went wrong: {error.message}

</div>

);

}

const bookings = data?.myBookings ?? [];

return (

<div className="min-h-screen bg-gray-50">
<Navbar />
<div className="mx-auto max-w-6xl p-6">

<h1 className="mb-8 text-3xl font-bold text-gray-900">My Trips</h1>

<div className="space-y-6">

{bookings.map((booking: any) => (

<BookingCard key={booking.id} booking={booking} />

))}

</div>

</div>

</div>

);

}