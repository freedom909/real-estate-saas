"use client";

import RoleGuard from "../../components/shared/RoleGuard";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client/core";

const REVENUE_DATA = gql`
  query HostRevenue {
    myBookings {
      id
      status
      price
      checkInDate
      checkOutDate
      createdAt
      listing { id title }
    }
  }
`;

export default function HostRevenuePage() {
  return (
    <RoleGuard allowedRoles={["HOST", "OWNER", "ADMIN", "SUPER_ADMIN"]}>
      <HostRevenueContent />
    </RoleGuard>
  );
}

function HostRevenueContent() {
  const { data, loading } = useQuery<any>(REVENUE_DATA);
  const bookings = data?.myBookings ?? [];

  const completed = bookings.filter((b: any) => b.status === "COMPLETED");
  const confirmed = bookings.filter((b: any) => b.status === "CONFIRMED");

  const totalRevenue = completed.reduce((sum: number, b: any) => sum + (b.price || 0), 0);
  const pendingRevenue = confirmed.reduce((sum: number, b: any) => sum + (b.price || 0), 0);

  // Group by month
  const monthlyRevenue: Record<string, number> = {};
  completed.forEach((b: any) => {
    const month = b.checkInDate?.substring(0, 7) || "Unknown";
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (b.price || 0);
  });

  const sortedMonths = Object.entries(monthlyRevenue).sort(([a], [b]) => b.localeCompare(a));

  // Revenue by listing
  const listingRevenue: Record<string, { title: string; revenue: number; count: number }> = {};
  completed.forEach((b: any) => {
    const id = b.listing?.id || "unknown";
    if (!listingRevenue[id]) listingRevenue[id] = { title: b.listing?.title || "Unknown", revenue: 0, count: 0 };
    listingRevenue[id].revenue += b.price || 0;
    listingRevenue[id].count += 1;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Revenue</h1>
        <p className="text-sm text-gray-500">Track your earnings and financial overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">¥{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">{completed.length} completed bookings</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Pending Revenue</p>
          <p className="text-3xl font-bold text-amber-600">¥{pendingRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">{confirmed.length} confirmed bookings</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Avg. per Booking</p>
          <p className="text-3xl font-bold text-gray-900">
            ¥{completed.length > 0 ? Math.round(totalRevenue / completed.length).toLocaleString() : "0"}
          </p>
          <p className="text-xs text-gray-400 mt-1">across all listings</p>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-200 rounded" />)}
            </div>
          ) : sortedMonths.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No completed bookings yet</p>
          ) : (
            <div className="space-y-3">
              {sortedMonths.map(([month, revenue]) => (
                <div key={month} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm font-medium text-gray-700">{month}</span>
                  <span className="text-sm font-bold text-green-600">¥{revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue by Listing</h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-200 rounded" />)}
            </div>
          ) : Object.keys(listingRevenue).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No completed bookings yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(listingRevenue)
                .sort(([, a], [, b]) => b.revenue - a.revenue)
                .map(([id, data]) => (
                  <div key={id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <span className="text-sm font-medium text-gray-700">{data.title}</span>
                      <span className="text-xs text-gray-400 ml-2">({data.count} bookings)</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">¥{data.revenue.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
