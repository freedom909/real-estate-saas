"use client";

import { useQuery } from "@apollo/client/react";
import { MY_BOOKINGS } from "@/app/graphql/booking/queries/myBookings";
import AdminLayout from "@/app/components/admin/AdminLayout";
import AdminGuard from "@/app/components/admin/AdminGuard";
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

export default function AdminBookingsPage() {
  return (
    <AdminGuard>
      <AdminBookingsContent />
    </AdminGuard>
  );
}

function AdminBookingsContent() {
  const { data, loading, error } = useQuery<{ myBookings: Booking[] }>(MY_BOOKINGS);

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-red-600">Error loading bookings: {error.message}</div>
      </AdminLayout>
    );
  }

  const bookings = data?.myBookings ?? [];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-sm text-gray-500">Manage bookings for your listings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500">No bookings found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          booking.listing?.pictures?.[0]?.url
                            || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=100&auto=format&fit=crop"
                        }
                        alt={booking.listing?.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{booking.listing?.title || "Untitled"}</div>
                        <div className="text-xs text-gray-500">{booking.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(booking.checkInDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(booking.checkOutDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ¥{booking.price?.toLocaleString() || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-800"}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
