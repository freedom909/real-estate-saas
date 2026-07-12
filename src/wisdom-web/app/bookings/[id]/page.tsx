// src/wisdom-web/app/bookings/[id]/page.tsx

import Navbar from "app/components/navbar";
import { useMutation } from "@apollo/client/react";
import { CREATE_BOOKING } from "app/graphql/booking/mutations/createBooking";


export default function BookingPage() {
const [createBooking, { loading }] = useMutation(CREATE_BOOKING);
return (

<>

<Navbar />

<div className="max-w-4xl mx-auto p-8">

<h1 className="text-3xl font-bold mb-6">My Bookings</h1>

<div className="border rounded-xl p-6 shadow">

<p className="text-gray-500">

No bookings yet.

</p>

</div>

</div>

</>

);

}