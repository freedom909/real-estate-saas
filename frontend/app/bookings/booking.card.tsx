// 预订卡片

"use client";
import Link from "next/link";
import { BookingStatusBadge } from "./bookingStatus.badge";


export function BookingCard({ booking }: any) {
const nights = Math.ceil(

(new Date(booking.checkOutDate).getTime() -

new Date(booking.checkInDate).getTime()) /

(1000 * 60 * 60 * 24)

);
return (

<Link href={`/bookings/${booking.id}`}>

<div className="overflow-hidden rounded-2xl border bg-white hover:shadow-lg transition">

<div className="flex flex-col md:flex-row">

<img

src={
  booking.listing?.picture?.[0] || 
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop"
}

alt={booking.listing?.title}

className="h-56 w-full object-cover md:w-80"

/>

<div className="flex flex-1 flex-col justify-between p-5">

<div>

<div className="mb-3 flex items-start justify-between">

<div>

<p className="text-sm text-gray-500">Your stay</p>

<h2 className="text-xl font-semibold text-gray-900">

{booking.listing?.title || "Untitled Listing"}

</h2>

</div>

<BookingStatusBadge status={booking.status} />

</div>

<div className="space-y-2 text-sm text-gray-600">

<p>

📅 {new Date(booking.checkInDate).toLocaleDateString()} → {new Date(booking.checkOutDate).toLocaleDateString()}

</p>

<p>🌙 {nights} nights</p>

<p className="font-mono text-xs">

Booking ID: {booking.id.slice(0, 8)}...

</p>

</div>

</div>

<div className="mt-5 flex items-end justify-between">

<div>

<p className="text-xs text-gray-500">Per Night</p>

<p className="text-2xl font-bold text-gray-900">
{booking.listing?.price != null
  ? `¥${booking.listing.price.toLocaleString()}`
  : "-"}

</p>

</div>

<span className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50">

View details

</span>

</div>

</div>

</div>

</div>

</Link>

);
}