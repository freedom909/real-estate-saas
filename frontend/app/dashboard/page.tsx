'use client';

import { useAuthStore } from "@/app/store/auth.store";
import Navbar from "@/app/components/navbar";
import Link from "next/link";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.accessToken);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome{user?.name ? `, ${user.name}` : ""}
            </h1>
            <p className="text-gray-500 mt-1">
              {isAuthenticated ? "Here's what's happening today" : "Please log in to access your dashboard"}
            </p>
          </div>

          {!isAuthenticated ? (
            /* Not logged in */
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-500 mb-4">You're not logged in yet.</p>
              <Link
                href="/login"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            /* Quick Actions Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/listing" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                <div className="text-3xl mb-3">🏠</div>
                <h3 className="font-semibold text-gray-900">Browse Listings</h3>
                <p className="text-sm text-gray-500 mt-1">Find your next vacation rental</p>
              </Link>

              <Link href="/bookings" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                <div className="text-3xl mb-3">📅</div>
                <h3 className="font-semibold text-gray-900">My Bookings</h3>
                <p className="text-sm text-gray-500 mt-1">View and manage your reservations</p>
              </Link>

              <Link href="/assistant" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                <div className="text-3xl mb-3">🤖</div>
                <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                <p className="text-sm text-gray-500 mt-1">Get help with your search</p>
              </Link>

              <Link href="/locations" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                <div className="text-3xl mb-3">📍</div>
                <h3 className="font-semibold text-gray-900">Locations</h3>
                <p className="text-sm text-gray-500 mt-1">Explore popular destinations</p>
              </Link>

              <Link href="/carts" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                <div className="text-3xl mb-3">🛒</div>
                <h3 className="font-semibold text-gray-900">Cart</h3>
                <p className="text-sm text-gray-500 mt-1">Review items in your cart</p>
              </Link>

              <Link href="/campaign" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-semibold text-gray-900">Campaigns</h3>
                <p className="text-sm text-gray-500 mt-1">View available deals and promotions</p>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
