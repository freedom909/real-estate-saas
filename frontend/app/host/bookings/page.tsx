"use client";

import RoleGuard from "../../components/shared/RoleGuard";
import HostLayout from "../layout";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client/core";

const MY_HOST_BOOKINGS = gql`
  query MyHostBookings {
    myBookings {
      id
      status
      checkInDate
      checkOutDate
      price
      createdAt
      listing { id title }
      user { id name email }
    }
  }
`;

const ACTIVE_STATUSES = new Set(["PENDING", "CONFIRMED", "CHECKED_IN"]);

/** Build a set of booking IDs that are part of an overbooking */
function findOverbookedBookingIds(bookings: any[]): Set<string> {
  // Group active bookings by listingId
  const byListing: Record<string, any[]> = {};
  for (const b of bookings) {
    if (!b.listing?.id || !ACTIVE_STATUSES.has(b.status)) continue;
    if (!byListing[b.listing.id]) byListing[b.listing.id] = [];
    byListing[b.listing.id].push(b);
  }

  const conflictIds = new Set<string>();

  for (const listingBookings of Object.values(byListing)) {
    if (listingBookings.length <= 1) continue;

    // For each pair of bookings, check date overlap
    for (let i = 0; i < listingBookings.length; i++) {
      for (let j = i + 1; j < listingBookings.length; j++) {
        const a = listingBookings[i];
        const b = listingBookings[j];
        const aStart = new Date(a.checkInDate).getTime();
        const aEnd = new Date(a.checkOutDate).getTime();
        const bStart = new Date(b.checkInDate).getTime();
        const bEnd = new Date(b.checkOutDate).getTime();

        // Overlap if aStart <= bEnd AND bStart <= aEnd
        if (aStart <= bEnd && bStart <= aEnd) {
          conflictIds.add(a.id);
          conflictIds.add(b.id);
        }
      }
    }
  }

  return conflictIds;
}

export default function HostBookingsPage() {
  return (
    <RoleGuard allowedRoles={["HOST", "OWNER", "ADMIN", "SUPER_ADMIN"]}>
      <HostLayout>
        <HostBookingsContent />
      </HostLayout>
    </RoleGuard>
  );
}

function HostBookingsContent() {
  const { data, loading } = useQuery<any>(MY_HOST_BOOKINGS);
  const bookings = data?.myBookings ?? [];

  const pending = bookings.filter((b: any) => b.status === "PENDING");
  const confirmed = bookings.filter((b: any) => b.status === "CONFIRMED");
  const checkedIn = bookings.filter((b: any) => b.status === "CHECKED_IN");
  const completed = bookings.filter((b: any) => b.status === "COMPLETED");
  const cancelled = bookings.filter((b: any) => b.status === "CANCELLED");

  const overbookedIds = findOverbookedBookingIds(bookings);
  const hasOverbookings = overbookedIds.size > 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-sm text-gray-500">Guest reservations for your listings</p>
      </div>

      {/* ⚠️ Overbooking Alert */}
      {hasOverbookings && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <h3 className="font-semibold text-red-800">Overlapping Bookings Detected!</h3>
              <p className="text-sm text-red-700 mt-1">
                {overbookedIds.size} booking(s) have date conflicts with other active bookings for the same listing.
                These rows are highlighted below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <SummaryCard label="Pending" count={pending.length} color="yellow" icon="⏳" />
        <SummaryCard label="Confirmed" count={confirmed.length} color="green" icon="✅" />
        <SummaryCard label="Checked In" count={checkedIn.length} color="blue" icon="🏨" />
        <SummaryCard label="Completed" count={completed.length} color="gray" icon="🏁" />
        <SummaryCard label="Cancelled" count={cancelled.length} color="red" icon="❌" />
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
          No bookings yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Guest</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Listing</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Check-in</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Check-out</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.map((b: any) => {
                const isConflict = overbookedIds.has(b.id);
                return (
                  <tr
                    key={b.id}
                    className={`hover:bg-gray-50 ${isConflict ? "bg-red-50" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{b.user?.name || "Guest"}</div>
                      <div className="text-xs text-gray-500">{b.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {b.listing?.title || "—"}
                      {isConflict && <span className="ml-1 text-red-600 font-semibold">❌</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{b.checkInDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{b.checkOutDate}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">¥{(b.price || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={b.status} isConflict={isConflict} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, count, color, icon }: { label: string; count: number; color: string; icon: string }) {
  const colorMap: Record<string, string> = {
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    green: "bg-green-50 text-green-700 border-green-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-xs font-medium uppercase">{label}</span>
      </div>
      <p className="text-2xl font-bold">{count}</p>
    </div>
  );
}

function StatusBadge({ status, isConflict }: { status: string; isConflict?: boolean }) {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CHECKED_IN: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
      isConflict
        ? "bg-red-200 text-red-900 ring-1 ring-red-300"
        : colors[status] || "bg-gray-100 text-gray-800"
    }`}>
      {isConflict && "⚠️ "}{status}
    </span>
  );
}
