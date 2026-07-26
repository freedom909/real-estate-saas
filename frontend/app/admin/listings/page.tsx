"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { GET_LISTINGS } from "@/app/graphql/listing/queries/listings";
import AdminGuard from "@/app/components/admin/AdminGuard";
import AdminLayout from "@/app/components/admin/AdminLayout";

export default function AdminListingsPage() {
  return (
    <AdminGuard>
      <AdminListingsContent />
    </AdminGuard>
  );
}

function AdminListingsContent() {
  const { data, loading, error } = useQuery<any>(GET_LISTINGS);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-gray-500">Loading listings...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-red-500">Error: {error.message}</p>
        </div>
      </AdminLayout>
    );
  }

  const listings = data?.listings ?? [];

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Listings</h1>
          <p className="text-gray-500 mt-1">Manage all property listings</p>
        </div>
        <Link
          href="/admin/listings/new"
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          + New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">No listings found.</p>
          <Link
            href="/admin/listings/new"
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
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Address</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Price</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Beds</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Featured</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing: any) => (
                <tr key={listing.id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-medium">{listing.title}</td>
                  <td className="py-3 px-4 text-gray-500">{listing.address}</td>
                  <td className="py-3 px-4 font-medium">¥{listing.price?.toLocaleString()}</td>
                  <td className="py-3 px-4">{listing.numOfBeds}</td>
                  <td className="py-3 px-4">
                    {listing.isFeatured ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">Featured</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/listings/${listing.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
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
