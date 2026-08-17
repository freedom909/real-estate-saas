"use client";

import RoleGuard from "../components/shared/RoleGuard";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client/core";

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

function HostOverview() {
  const { data, loading } = useQuery<any>(HOST_STATS);

  const bookings = data?.myBookings ?? [];
  const listings = data?.myListings ?? [];

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
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.slice(0, 5).map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{b.listing?.title || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{b.checkInDate} → {b.checkOutDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">¥{(b.price || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={b.status} />
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
