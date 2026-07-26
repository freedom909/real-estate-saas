"use client";

import { useQuery } from "@apollo/client/react";
import { useAuthStore } from "@/app/store/auth.store";
import { BOOKINGS_FOR_CUSTOMER } from "@/app/graphql/booking/queries/myBookings";
import { BookingCard } from "./booking.card";
import Navbar from "@/app/components/navbar";

export default function MyBookingsPage() {
  const { user } = useAuthStore();

  const { data, loading, error } = useQuery(BOOKINGS_FOR_CUSTOMER, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold">Please login</h2>
            <p className="mb-6 text-gray-600">Please login to view your bookings.</p>
            <a
              href="/login"
              className="inline-block rounded-lg bg-black px-6 py-3 text-white"
            >
              Go to Login
            </a>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-6xl p-6">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">My Trips</h1>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-2xl border bg-white">
                <div className="flex flex-col md:flex-row">
                  <div className="h-56 w-full bg-gray-200 md:w-80" />
                  <div className="flex-1 p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    const isUnauthenticated = error.message.includes("Unauthenticated");

    if (isUnauthenticated) {
      return (
        <>
          <Navbar />
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold">Please login</h2>
              <p className="mb-6 text-gray-600">Please login to view your bookings.</p>
              <a
                href="/login"
                className="inline-block rounded-lg bg-black px-6 py-3 text-white"
              >
                Go to Login
              </a>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-6xl p-6">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">My Trips</h1>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700 font-medium">Failed to load bookings</p>
            <p className="text-red-600 text-sm mt-1">{error.message}</p>
          </div>
        </div>
      </>
    );
  }

  const bookings = data?.bookingsForCustomer ?? [];

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-6xl p-6">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">My Trips</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🏠</div>
            <p className="text-xl text-gray-600 mb-2">No bookings yet</p>
            <p className="text-gray-400 mb-6">Your trips will appear here after you make a booking.</p>
            <a href="/listing" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Browse Listings
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking: any) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
