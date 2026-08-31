"use client";

import RoleGuard from "../components/shared/RoleGuard";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import Link from "next/link";
import { useAuthStore } from "@/app/store/auth.store";

export default function HostPageWrapper() {
  return (
    <RoleGuard allowedRoles={["HOST", "OWNER", "ADMIN", "SUPER_ADMIN"]}>
      <HostOverview />
    </RoleGuard>
  );
}

const HOST_STATS = gql`
  query HostStats {
    myBookings {
      id
      status
      price
      checkInDate
      checkOutDate
      listing { id title }
    }
    myListings {
      id
      title
      isFeatured
    }
  }
`;

const CONFIRM_BOOKING = gql`
  mutation ConfirmBooking($id: ID!) {
    confirmBooking(id: $id) {
      id
      status
    }
  }
`;

function HostOverview() {
  const { user } = useAuthStore();
  const isHostOrAbove = (
    user?.role === "HOST" ||
    user?.role === "OWNER" ||
    user?.role === "AGENT" ||
    user?.role === "ADMIN" ||
    user?.role === "SUPER_ADMIN"
  );
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const { data, loading } = useQuery<any>(HOST_STATS, {
    context: { headers: { Authorization: token } },
  });
  const [confirmBooking, { loading: confirming }] = useMutation<any>(CONFIRM_BOOKING, {
    context: { headers: { Authorization: token } },
    update: (cache, { data: result }) => {
      const confirmedId = result?.confirmBooking?.id;
      if (!confirmedId) return;
      cache.updateQuery({ query: HOST_STATS }, (prev: any) => {
        if (!prev?.myBookings) return prev;
        return {
          ...prev,
          myBookings: prev.myBookings.map((b: any) =>
            b.id === confirmedId ? { ...b, status: "CONFIRMED" } : b
          ),
        };
      });
    },
  });

  const bookings = data?.myBookings ?? [];
  const listings = data?.myListings ?? [];

  const handleConfirm = async (bookingId: string) => {
    if (confirming) return;
    if (!confirm(`Confirm this booking (${bookingId})?`)) return;
    try {
      await confirmBooking({ variables: { id: bookingId } });
    } catch (err) {
      console.error("Confirm booking failed:", err);
    }
  };

  const activeBookings = bookings.filter((b: any) => ["PENDING", "CONFIRMED", "CHECKED_IN"].includes(b.status));
  const completedBookings = bookings.filter((b: any) => b.status === "COMPLETED");
  const totalRevenue = completedBookings.reduce((sum: number, b: any) => sum + (b.price || 0), 0);
  const activeListings = listings; // all listings returned are active

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Active Listings" value={activeListings.length} icon="🏠" color="green" />
        <StatCard title="Active Bookings" value={activeBookings.length} icon="📅" color="blue" />
        <StatCard title="Total Revenue" value={`¥${totalRevenue.toLocaleString()}`} icon="💰" color="amber" />
        <StatCard title="Completed" value={completedBookings.length} icon="✅" color="purple" />
      </div>

      {/* Recent Bookings */}
      <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
          No bookings yet. Make sure your listings are active and visible.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Listing</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.slice(0, 5).map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50 group">
                  <td className="px-6 py-4">
                    <Link href={`/bookings/${b.id}`} className="block">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                        {b.listing?.title || "—"}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 group-hover:text-blue-500">
                        View Details →
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{b.checkInDate} → {b.checkOutDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">¥{(b.price || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center gap-2 justify-end">
                      {isHostOrAbove && b.status === "PENDING" && (
                        <button
                          onClick={() => handleConfirm(b.id)}
                          disabled={confirming}
                          className="px-3 py-1.5 text-xs rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {confirming ? "Confirming..." : "Confirm"}
                        </button>
                      )}
                      <Link
                        href={`/bookings/${b.id}`}
                        className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                      >
                        Details
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) {
  const colorMap: Record<string, string> = {
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{title}</p>
        <span className={`text-2xl p-2 rounded-xl ${colorMap[color] || "bg-gray-50 text-gray-600"}`}>{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CHECKED_IN: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
}
