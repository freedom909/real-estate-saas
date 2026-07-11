"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import client from "@/lib/apolloClient";
import { GET_USER_BOOKINGS, GET_UPCOMING_BOOKINGS } from "@/graphql/bookings";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import FacebookSignInButton from "@/components/FacebookSignInButton";

function BookingCard({ booking }) {
  return (
    <div className="border rounded p-4 flex items-center justify-between">
      <div>
        <div className="font-medium">{booking.bookingNumber}</div>
        <div className="text-sm text-gray-600">{new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}</div>
        <div className="text-sm">¥{booking.totalPrice}</div>
      </div>
      <span className="px-2 py-1 text-xs rounded bg-gray-100">{booking.status}</span>
    </div>
  );
}

function BookingList({ bookings, emptyText }) {
  if (!bookings?.length) return <p className="text-gray-600">{emptyText}</p>;
  return (
    <div className="space-y-3">
      {bookings.map(b => <BookingCard key={b.id} booking={b} />)}
    </div>
  );
}

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const [showDemo, setShowDemo] = useState(false);
  const [activeTab, setActiveTab] = useState("Upcoming");
  const userId = session?.user?.id;
  const { data, loading } = useQuery(GET_USER_BOOKINGS, {
    client,
    variables: { userId },
    skip: !userId,
  });
  const { data: upcomingData, loading: loadingUpcoming } = useQuery(GET_UPCOMING_BOOKINGS, {
    client,
    variables: { userId, days: 90 },
    skip: !userId,
  });

  const bookings = data?.userBookings || [];
  const upcoming = upcomingData?.upcomingBookings || [];
  const now = new Date();
  const past = bookings.filter(b => {
    const out = new Date(b.checkOutDate);
    return !isNaN(out) && out < now;
  }).sort((a,b) => new Date(b.checkOutDate) - new Date(a.checkOutDate));
  const demoBookings = [
    { id: "d1", bookingNumber: "BK-2025-0001", checkInDate: new Date().toISOString(), checkOutDate: new Date(Date.now()+86400000).toISOString(), status: "PENDING", totalPrice: 120 },
    { id: "d2", bookingNumber: "BK-2025-0002", checkInDate: new Date(Date.now()+86400000*3).toISOString(), checkOutDate: new Date(Date.now()+86400000*5).toISOString(), status: "CONFIRMED", totalPrice: 240 },
  ];

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-blue-100 shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-xl font-bold text-blue-600">🏠 Minshuku</Link>
                <div className="hidden md:flex space-x-6">
                  <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">🏠 Home</Link>
                  <Link href="/search" className="text-gray-700 hover:text-blue-600 transition-colors">🔍 Search</Link>
                  <Link href="/listings" className="text-gray-700 hover:text-blue-600 transition-colors">📋 Listings</Link>
                  <Link href="/bookings" className="text-gray-700 hover:text-blue-600 transition-colors">📅 Bookings</Link>
                  <Link href="/profile" className="text-gray-700 hover:text-blue-600 transition-colors">👤 Profile</Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Sign in to view your bookings</h2>
            <p className="text-gray-600 mb-4">Connect your account to see current, upcoming, and past bookings.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <GoogleSignInButton />
              <FacebookSignInButton />
            </div>
            <button className="w-full px-4 py-2 rounded bg-gray-100" onClick={() => setShowDemo(!showDemo)}>{showDemo ? "Hide Demo" : "Preview Demo"}</button>
          </div>
          {showDemo && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Demo Bookings</h3>
              <BookingList bookings={demoBookings} emptyText="No demo bookings" />
            </div>
          )}
          <div className="mt-6 text-center">
            <a href="/search" className="text-blue-600">Browse listings</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-100 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-blue-600">🏠 Minshuku</Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">🏠 Home</Link>
                <Link href="/search" className="text-gray-700 hover:text-blue-600 transition-colors">🔍 Search</Link>
                <Link href="/listings" className="text-gray-700 hover:text-blue-600 transition-colors">📋 Listings</Link>
                <Link href="/bookings" className="text-gray-700 hover:text-blue-600 transition-colors">📅 Bookings</Link>
                <Link href="/profile" className="text-gray-700 hover:text-blue-600 transition-colors">👤 Profile</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
        <div className="flex gap-2 mb-4">
          {[
            { key: "Upcoming", count: upcoming.length },
            { key: "Past", count: past.length },
          ].map(t => (
            <button
              key={t.key}
              className={`px-4 py-2 rounded border ${activeTab === t.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800'}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.key} {typeof t.count === 'number' ? `(${t.count})` : ''}
            </button>
          ))}
        </div>

        {(loading || loadingUpcoming) && <div>Loading...</div>}

        {!loading && !loadingUpcoming && (
          <div className="grid gap-6">
            {activeTab === "Upcoming" && (
              <section>
                <h2 className="text-lg font-semibold mb-2">Upcoming</h2>
                <BookingList bookings={upcoming} emptyText="No upcoming bookings." />
              </section>
            )}
            {activeTab === "Past" && (
              <section>
                <h2 className="text-lg font-semibold mb-2">Past</h2>
                <BookingList bookings={past} emptyText="No past bookings." />
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}