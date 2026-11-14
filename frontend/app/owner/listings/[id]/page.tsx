// src/frontend/app/owner/listings/[id]/page.tsx


"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";

import { GET_LISTING } from "@/app/graphql/listing/queries/listing";
import {
  PUBLISH_LISTING,
  UNPUBLISH_LISTING,
} from "@/app/graphql/listing/mutations/listing";

import OwnerGuard from "@/app/components/owner/OwnerGuard";
import OwnerLayout from "@/app/components/owner/OwnerLayout";

type Listing = {
  id: string;
  title: string;
  description: string;
  locationId: string;
  pricePerNight: number;
  pictures: {
    id: string;
    objectKey: string;
    url?: string;
    sortOrder: number;
  }[];
  numOfBeds: number;
  numOfCustomers: number;
  isFeatured: boolean;
  status: string;
};

export default function OwnerListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <OwnerGuard>
      <OwnerListingDetailContent params={params} />
    </OwnerGuard>
  );
}

function OwnerListingDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data, loading, error, refetch } = useQuery<{
    listing: Listing;
  }>(GET_LISTING, {
    variables: { id },
  });

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

  const listing = data?.listing;
  console.log("[Owner Listing Detail]", {
  listing,
  status: listing?.status,
});
  const busy = publishing || unpublishing;

  const handlePublish = async () => {
    try {
      await publishListing({ variables: { id } });
    } catch (err: any) {
      alert(`Publish failed: ${err.message}`);
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishListing({ variables: { id } });
    } catch (err: any) {
      alert(`Unpublish failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <OwnerLayout>
        <p className="text-gray-500 p-6">Loading listing...</p>
      </OwnerLayout>
    );
  }

  if (error) {
    return (
      <OwnerLayout>
        <p className="text-red-500 p-6">
          Error: {error.message}
        </p>
      </OwnerLayout>
    );
  }

  if (!listing) {
    return (
      <OwnerLayout>
        <p className="text-gray-500 p-6">Listing not found.</p>
      </OwnerLayout>
    );
  }

  const canPublish =
    listing.status === "DRAFT" ||
    listing.status === "UNPUBLISHED";

  const canUnpublish = listing.status === "PUBLISHED";

  return (
    <OwnerLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Listing Details
            </h1>
            <p className="text-gray-500 mt-1">
              {listing.title}
            </p>
          </div>

          <button
            onClick={() => router.push("/owner/listings")}
            className="text-gray-600 hover:text-black"
          >
            ← Back to listings
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-gray-500">Current status</p>
              <p className="text-lg font-semibold mt-1">
                {listing.status}
              </p>
            </div>

            {canPublish && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={busy}
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {publishing ? "Publishing..." : "Publish"}
              </button>
            )}

            {canUnpublish && (
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={busy}
                className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {unpublishing ? "Unpublishing..." : "Unpublish"}
              </button>
            )}
          </div>

          <hr />

          <div>
            <h2 className="font-semibold mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {listing.description || "-"}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Price per night</p>
              <p className="font-semibold">
                ¥{listing.pricePerNight?.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Beds</p>
              <p className="font-semibold">{listing.numOfBeds}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Guests</p>
              <p className="font-semibold">{listing.numOfCustomers}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Featured</p>
              <p className="font-semibold">
                {listing.isFeatured ? "Yes" : "No"}
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-3">Images</h2>

            {listing.pictures?.length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {listing.pictures.map((picture) => (
                  <img
                    key={picture.id}
                    src={picture.url || picture.objectKey}
                    alt={listing.title}
                    className="w-full h-40 object-cover rounded-lg border"
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                No images available.
              </p>
            )}
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
