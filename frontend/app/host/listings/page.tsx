"use client";

import RoleGuard from "../../components/shared/RoleGuard";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import Link from "next/link";

const MY_LISTINGS_WITH_BOOKINGS = gql`
  query MyHostListingsWithBookings {
    myListings {
      id
      title
      description
      price
      pricePerNight
      numOfCustomers
      numOfBeds
      isFeatured
      pictures { url }
    }
    myBookings {
      id
      status
      checkInDate
      checkOutDate
      listing { id }
    }
  }
`;

const ACTIVE_STATUSES = new Set(["PENDING", "CONFIRMED", "CHECKED_IN"]);

/** Check if a listing has any date with >1 active booking */
function detectOverbooking(listingId: string, bookings: any[]): { hasConflict: boolean; conflictDates: string[] } {
  const listingBookings = bookings.filter(
    (b: any) => b.listing?.id === listingId && ACTIVE_STATUSES.has(b.status)
  );

  if (listingBookings.length <= 1) return { hasConflict: false, conflictDates: [] };

  // Build date → booking count
  const dateCount: Record<string, number> = {};
  for (const b of listingBookings) {
    if (!b.checkInDate || !b.checkOutDate) continue;
    const start = new Date(b.checkInDate);
    const end = new Date(b.checkOutDate);
    const current = new Date(start);
    while (current <= end) {
      const key = current.toISOString().substring(0, 10);
      dateCount[key] = (dateCount[key] || 0) + 1;
      current.setDate(current.getDate() + 1);
    }
  }

  const conflictDates = Object.entries(dateCount)
    .filter(([_, count]) => count > 1)
    .map(([date]) => date);

  return { hasConflict: conflictDates.length > 0, conflictDates };
}

export default function HostListingsPage() {
  return (
    <RoleGuard allowedRoles={["HOST", "OWNER", "ADMIN", "SUPER_ADMIN"]}>
      <HostListingsContent />
    </RoleGuard>
  );
}

function HostListingsContent() {
  const { data, loading } = useQuery<any>(MY_LISTINGS_WITH_BOOKINGS);
  const listings = data?.myListings ?? [];
  const bookings = data?.myBookings ?? [];

  // Pre-compute overbooking per listing
  const overbookingMap = new Map<string, { hasConflict: boolean; conflictDates: string[] }>();
  for (const listing of listings) {
    overbookingMap.set(listing.id, detectOverbooking(listing.id, bookings));
  }

  const overbookedListings = [...overbookingMap.entries()].filter(([_, v]) => v.hasConflict);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-sm text-gray-500">Manage your properties</p>
        </div>
        <Link
          href="/host/listings/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          + New Listing
        </Link>
      </div>

      {/* ⚠️ Overbooking Alert */}
      {overbookedListings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <h3 className="font-semibold text-red-800">Overbooking Detected!</h3>
              <p className="text-sm text-red-700 mt-1">
                {overbookedListings.length} listing(s) have overlapping active bookings:
              </p>
              <ul className="mt-2 space-y-1">
                {overbookedListings.map(([id, info]) => {
                  const listing = listings.find((l: any) => l.id === id);
                  return (
                    <li key={id} className="text-sm text-red-700">
                      • <strong>{listing?.title || id}</strong> — {info.conflictDates.length} conflicting date(s)
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl shadow-sm p-6">
              <div className="h-40 bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-4xl mb-4">🏠</p>
          <p className="text-gray-500 mb-4">You don&apos;t have any listings yet.</p>
          <Link
            href="/host/listings/new"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing: any) => {
            const overbooking = overbookingMap.get(listing.id);
            const isOverbooked = overbooking?.hasConflict;

            return (
              <div
                key={listing.id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition relative ${
                  isOverbooked ? "ring-2 ring-red-400" : ""
                }`}
              >
                {/* ❌ Overbooked Badge */}
                {isOverbooked && (
                  <div className="absolute top-3 right-3 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <span>❌</span> OVERBOOKED
                  </div>
                )}

                {listing.imageUrl ? (
                  <img src={listing.imageUrl} alt={listing.title} className="h-40 w-full object-cover" />
                ) : (
                  <div className="h-40 bg-gray-100 flex items-center justify-center text-4xl">🏠</div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
                    <div className="flex items-center gap-1">
                      {isOverbooked && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          ⚠️ Conflict
                        </span>
                      )}
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        Active
                      </span>
                    </div>
                  </div>
                  {listing.address && (
                    <p className="text-sm text-gray-500 mb-2">📍 {listing.address}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-green-600">¥{(listing.price || 0).toLocaleString()}<span className="text-sm font-normal text-gray-500">/night</span></p>
                    <Link href={`/host/listings/${listing.id}`} className="text-sm text-blue-600 hover:underline">
                      Edit →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
