"use client";

import { useQuery } from "@apollo/client/react";
import Navbar from "app/components/navbar";
import { BOOKING_BY_ID } from "app/graphql/booking/queries/bookingById";
import PaymentStatusBadge from "app/payments/paymentStatus.badge";
import { useParams } from "next/navigation";

export default function BookingDetailPage() {

const params = useParams();
const { data, loading, error } = useQuery(BOOKING_BY_ID, {

variables: { id: params.id },

});
const booking = data?.booking;

return (

<>

<Navbar />

<div className="p-8 bg-gray-500">
<div className="mx-auto max-w-4xl">

<h1 className="mb-6 text-3xl font-bold text-white">Booking Detail</h1>

<div className="overflow-hidden rounded-2xl border bg-gray-300 shadow-md">

<img

src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop"

className="h-72 w-full object-cover"

/>
<div className="flex items-center justify-between">

<div>

<p className="text-sm text-gray-500">Payment Status</p>

<PaymentStatusBadge status={booking.payment.status} />

</div>

<div className="text-right">

<p className="text-sm text-gray-500">Amount</p>

<p className="text-2xl font-bold">

¥{booking.payment.amount.toLocaleString()}

</p>

</div>

</div>
<div className="p-6">

<div className="mb-4 flex items-center justify-between">

<h2 className="text-2xl font-semibold">Tokyo Shinjuku Apartment</h2>

<span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">

CONFIRMED

</span>

</div>

<div className="space-y-3 text-gray-600">

<p><strong>Booking ID:</strong> {params.id}</p>

<p><strong>Check-in:</strong> 2026/07/20</p>

<p><strong>Check-out:</strong> 2026/07/23</p>

<p><strong>Nights:</strong> 3 nights</p>

<p><strong>Guests:</strong> 2 guests</p>

</div>

<div className="my-6 border-t pt-6">

<div className="flex items-center justify-between text-lg">

<span>Total Amount</span>

<span className="text-3xl font-bold">¥32,000</span>

</div>

</div>

<div className="rounded-xl bg-gray-50 p-4">

<h3 className="mb-2 font-semibold">Cancellation Policy</h3>

<p className="text-sm text-gray-600">

Free cancellation until 48 hours before check-in.

</p>

</div>

<div className="mt-6 flex gap-3">

<button className="flex-1 rounded-xl bg-black py-3 font-semibold text-white">

Contact Host

</button>

<button className="flex-1 rounded-xl border py-3 font-semibold">

Cancel Booking

</button>

</div>

</div>

</div>

</div>

</div>
</>
);

}