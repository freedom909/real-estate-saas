"use client";

import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import OwnerLayout from "@/app/components/owner/OwnerLayout";
import OwnerGuard from "@/app/components/owner/OwnerGuard";
import Link from "next/link";

const MY_STATS = gql`
  query MyBookings {
    myBookings {
      id
      status
      checkInDate
      checkOutDate
      price
      listing {
        id
        title
      }
    }
  }
`;

export default function OwnerDashboardPage() {
  return (
    <OwnerGuard>
      <OwnerDashboardContent />
    </OwnerGuard>
  );
}

function OwnerDashboardContent() {
  const { data, loading } = useQuery<{ myBookings: any[] }>(MY_STATS);
  const bookings = data?.myBookings ?? [];

  const totalRevenue = bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((sum, b) => sum + (b.price || 0), 0);

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;

  return (
    <OwnerLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Owner Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your listings and bookings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Total Bookings</p>
          <p className="text-3xl font-bold text-gray-900">{loading ? "..." : bookings.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{loading ? "..." : pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Confirmed</p>
          <p className="text-3xl font-bold text-green-600">{loading ? "..." : confirmedCount}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href="/owner/bookings"
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition flex-1"
        >
          <span className="text-2xl">📅</span>
          <h3 className="mt-2 font-semibold">View Bookings</h3>
          <p className="text-sm text-gray-500">Manage guest reservations</p>
        </Link>
        <Link
          href="/owner/listings"
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition flex-1"
        >
          <span className="text-2xl">🏡</span>
          <h3 className="mt-2 font-semibold">My Listings</h3>
          <p className="text-sm text-gray-500">Manage your properties</p>
        </Link>
      </div>
    </OwnerLayout>
  );
}
