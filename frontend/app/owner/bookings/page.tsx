"use client";

import { useQuery } from "@apollo/client/react";
import { MY_BOOKINGS } from "@/app/graphql/booking/queries/myBookings";
import OwnerLayout from "@/app/components/owner/OwnerLayout";
import OwnerGuard from "@/app/components/owner/OwnerGuard";
import Link from "next/link";

interface Booking {
  id: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  price: number;
  listing?: {
    id: string;
    title: string;
    pictures?: Array<{ url: string }>;
    price: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CHECKED_IN: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function OwnerBookingsPage() {
  return (
    <OwnerGuard>
      <OwnerBookingsContent />
    </OwnerGuard>
  );
}

function OwnerBookingsContent() {
  const { data, loading, error } = useQuery<{ myBookings: Booking[] }>(MY_BOOKINGS);

  if (loading) {
    return (
      <OwnerLayout>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </OwnerLayout>
    );
  }

  if (error) {
    return (
      <OwnerLayout>
        <div className="text-red-600">Error loading bookings: {error.message}</div>
      </OwnerLayout>
    );
  }

  const bookings = data?.myBookings ?? [];

  return (
    <OwnerLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-sm text-gray-500">Guest bookings for your listings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500">No bookings yet</p>
          <p className="text-sm text-gray-400 mt-1">When guests book your listings, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/bookings/${booking.id}`}
              className="block bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                <img
                  src={
                    booking.listing?.pictures?.[0]?.url
                      || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=100&auto=format&fit=crop"
                  }
                  alt={booking.listing?.title}
                  className="h-40 w-full object-cover md:w-48"
                />
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {booking.listing?.title || "Untitled Listing"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        📅 {new Date(booking.checkInDate).toLocaleDateString()} →{" "}
                        {new Date(booking.checkOutDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 font-mono">
                        Booking ID: {booking.id.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                      <p className="mt-2 text-lg font-bold text-gray-900">
                        {booking.listing?.price != null
                          ? `¥${booking.listing.price.toLocaleString()}`
                          : "-"}
                        <span className="text-xs font-normal text-gray-500">/night</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </OwnerLayout>
  );
}
