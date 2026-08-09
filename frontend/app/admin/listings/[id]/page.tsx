"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { GET_LISTING } from "@/app/graphql/listing/queries/listing";
import { UPDATE_LISTING } from "@/app/graphql/listing/mutations/updateListing";
import { DELETE_LISTING } from "@/app/graphql/listing/mutations/deleteListing";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminGuard from "@/app/components/admin/AdminGuard";
import AdminLayout from "@/app/components/admin/AdminLayout";

type Listing = {
  id: string;
  title: string;
  description: string;
  address: string;
  price: number;
  pricePerNight: number;
  pictures: { objectKey: string; sortOrder: number }[];
  numOfBeds: number;
  numOfBathrooms: number;
  numOfRooms: number;
  numOfCustomers: number;
  locationId: string;
  isFeatured: boolean;
  ownerId: string;
  categories: { id: string; name: string }[];
};

export default function AdminListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <AdminGuard>
      <AdminListingDetailContent params={params} />
    </AdminGuard>
  );
}

function AdminListingDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data, loading, error } = useQuery<{ listing: Listing }>(GET_LISTING, {
    variables: { id },
  });

  const [updateListing, { loading: saving }] = useMutation(UPDATE_LISTING);
  const [deleteListing, { loading: deleting }] = useMutation(DELETE_LISTING);

  const [form, setForm] = useState({
    title: "",
    description: "",
    address: "",
    price: "",
    pricePerNight: "",
    numOfBeds: "1",
    numOfBathrooms: "1",
    numOfRooms: "1",
    numOfCustomers: "2",
    locationId: "",
    isFeatured: false,
  });

  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const listing = data?.listing;

  useEffect(() => {
    if (listing) {
      setForm({
        title: listing.title || "",
        description: listing.description || "",
        address: listing.address || "",
        price: String(listing.price || ""),
        pricePerNight: String(listing.pricePerNight || ""),
        numOfBeds: String(listing.numOfBeds || 1),
        numOfBathrooms: String(listing.numOfBathrooms || 1),
        numOfRooms: String(listing.numOfRooms || 1),
        numOfCustomers: String(listing.numOfCustomers || 2),
        locationId: listing.locationId || "",
        isFeatured: listing.isFeatured || false,
      });
    }
  }, [listing]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-gray-500">Loading listing...</p>
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

  if (!listing) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-gray-500">Listing not found.</p>
        </div>
      </AdminLayout>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    setSaveMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage(null);

    try {
      await updateListing({
        variables: {
          id,
          input: {
            title: form.title,
            description: form.description,
            address: form.address,
            price: parseFloat(form.price) || 0,
            pricePerNight: parseFloat(form.pricePerNight) || parseFloat(form.price) || 0,
            numOfBeds: parseInt(form.numOfBeds) || 1,
            numOfBathrooms: parseInt(form.numOfBathrooms) || 1,
            numOfRooms: parseInt(form.numOfRooms) || 1,
            numOfCustomers: parseInt(form.numOfCustomers) || 2,
            locationId: form.locationId || "default-location",
            pictures: listing.pictures?.map((p) => ({
              objectKey: p.objectKey,
              sortOrder: p.sortOrder,
            })) ?? [],
            isFeatured: form.isFeatured,
            categories: listing.categories?.map((c) => c.id) ?? [],
          },
        },
      });
      setSaveMessage("Changes saved successfully.");
    } catch (e: any) {
      setSaveMessage(e.message || "Failed to save changes.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;

    try {
      await deleteListing({ variables: { id } });
      router.push("/admin/listings");
    } catch (e: any) {
      setSaveMessage(e.message || "Failed to delete listing.");
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Listing</h1>
          <p className="text-gray-500 mt-1">{listing.title}</p>
        </div>
        <button
          onClick={() => router.push("/admin/listings")}
          className="text-gray-500 hover:text-gray-700 transition"
        >
          &larr; Back to listings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 h-28 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price (¥)</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price Per Night (¥)</label>
                <input
                  type="number"
                  name="pricePerNight"
                  value={form.pricePerNight}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Beds</label>
                <input
                  type="number"
                  name="numOfBeds"
                  value={form.numOfBeds}
                  onChange={handleChange}
                  min="1"
                  className="w-full border rounded-lg p-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bathrooms</label>
                <input
                  type="number"
                  name="numOfBathrooms"
                  value={form.numOfBathrooms}
                  onChange={handleChange}
                  min="1"
                  className="w-full border rounded-lg p-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rooms</label>
                <input
                  type="number"
                  name="numOfRooms"
                  value={form.numOfRooms}
                  onChange={handleChange}
                  min="1"
                  className="w-full border rounded-lg p-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Guests</label>
                <input
                  type="number"
                  name="numOfCustomers"
                  value={form.numOfCustomers}
                  onChange={handleChange}
                  min="1"
                  className="w-full border rounded-lg p-3"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location ID</label>
              <input
                type="text"
                name="locationId"
                value={form.locationId}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Featured Listing</label>
            </div>

            {saveMessage && (
              <div className={`p-3 rounded-lg text-sm ${saveMessage.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {saveMessage}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-3 rounded-lg font-medium border-2 border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar - Images & Info */}
        <div className="space-y-6">
          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-3">Images</h3>
            {
            listing.pictures && listing.pictures.length > 0 ? (
              <div className="space-y-2">
                {listing.pictures.map((p, i) => (
                  <img
                    key={i}
                    src={p.objectKey}
                    alt={`${listing.title} ${i + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No images</p>
            )}
          </div>

          {/* Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-3">Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">ID</dt>
                <dd className="font-mono text-xs">{listing.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Owner ID</dt>
                <dd className="font-mono text-xs">{listing.ownerId}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Categories</dt>
                <dd>{listing.categories?.map((c) => c.name).join(", ") || "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Featured</dt>
                <dd>{listing.isFeatured ? "Yes" : "No"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
