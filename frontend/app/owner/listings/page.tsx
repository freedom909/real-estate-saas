// src/frontend/app/owner/listings/page.tsx


"use client";

import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client/react";

import { GET_LISTINGS } from "@/app/graphql/listing/queries/listings";

import {
  PUBLISH_LISTING,
  UNPUBLISH_LISTING,
} from "@/app/graphql/listing/mutations/listing";

import OwnerGuard from "@/app/components/owner/OwnerGuard";
import LocationAddress from "@/app/components/LocationAddress";
import OwnerLayout from "@/app/components/owner/OwnerLayout";

export default function OwnerListingsPage() {
  return (
    <OwnerGuard>
      <OwnerListingsContent />
    </OwnerGuard>
  );
}

function OwnerListingsContent() {
  const { data, loading, error, refetch } = useQuery<any>(
    GET_LISTINGS
  );

  const [publishListing, { loading: publishing }] = useMutation(
    PUBLISH_LISTING,
    {
      onCompleted: () => refetch(),
    }
  );

  const [unpublishListing, { loading: unpublishing }] = useMutation(
    UNPUBLISH_LISTING,
    {
      onCompleted: () => refetch(),
    }
  );

  const handlePublish = async (id: string) => {
    try {
      await publishListing({
        variables: { id },
      });
    } catch (err: any) {
      alert(`Publish failed: ${err.message}`);
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await unpublishListing({
        variables: { id },
      });
    } catch (err: any) {
      alert(`Unpublish failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <OwnerLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-gray-500">Loading listings...</p>
        </div>
      </OwnerLayout>
    );
  }

  if (error) {
    return (
      <OwnerLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-red-500">Error: {error.message}</p>
        </div>
      </OwnerLayout>
    );
  }

  const listings = data?.listings ?? [];

  return (
    <OwnerLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-gray-500 mt-1">
            Manage your property listings
          </p>
        </div>

        <Link
          href="/owner/listings/new"
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          + New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">No listings found.</p>

          <Link
            href="/owner/listings/new"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  Title
                </th>

                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  Address
                </th>

                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  Price
                </th>

                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  Beds
                </th>

                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  Featured
                </th>

                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  Status
                </th>

                <th className="text-right py-3 px-4 font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {listings.map((listing: any) => {
                const isPublishing = publishing || unpublishing;

                return (
                  <tr
                    key={listing.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 font-medium">
                      {listing.title}
                    </td>

                    <td className="py-3 px-4 text-gray-500">
                      <LocationAddress
                        locationId={listing.locationId}
                      />
                    </td>

                    <td className="py-3 px-4 font-medium">
                      ¥{listing.pricePerNight?.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      {listing.numOfBeds}
                    </td>

                    <td className="py-3 px-4">
                      {listing.isFeatured ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">
                          Featured
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-xs font-medium">
                        {listing.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/owner/listings/${listing.id}`}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        View
                      </Link>

                      {(listing.status === "DRAFT" ||
                        listing.status === "UNPUBLISHED") && (
                        <button
                          type="button"
                          disabled={isPublishing}
                          onClick={() => handlePublish(listing.id)}
                          className="text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 px-3 py-1 rounded"
                        >
                          {publishing ? "Publishing..." : "Publish"}
                        </button>
                      )}

                      {listing.status === "PUBLISHED" && (
                        <button
                          type="button"
                          disabled={isPublishing}
                          onClick={() => handleUnpublish(listing.id)}
                          className="text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 px-3 py-1 rounded"
                        >
                          {unpublishing ? "Unpublishing..." : "Unpublish"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </OwnerLayout>
  );
}
