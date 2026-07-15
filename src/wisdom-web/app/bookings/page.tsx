"use client";
import { useQuery } from "@apollo/client/react";
import { MY_BOOKINGS } from "app/graphql/booking/queries/myBookings";
import { BookingCard } from "./booking.card";
import Navbar from "app/components/navbar";


export default function MyBookingsPage() {

const token=typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
const { data, loading, error } = useQuery(MY_BOOKINGS, 
    { skip: false, context: { headers: { 'Authorization': token } } });
    console.log("loading =", loading);

console.log("error =", error);

console.log("data =", data);
if (loading) return <div className="p-6">Loading...</div>;

if (error) return <div className="p-6 text-red-500">Error: {error.message}</div>;

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