//frontend/app/listing/new/page.tsx
"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { CREATE_LISTING } from "@/app/graphql/listing/mutations/createListing";
import { CREATE_LOCATION } from "@/app/graphql/location/mutations/createLocation";
import { textToImage } from "@/app/services/imageGen";
import Navbar from "@/app/components/navbar";
import { useTenantStore } from "@/app/store/tenant.store";

export default function CreateListingPage() {
  const router = useRouter();
  const [createListing] = useMutation<any>(CREATE_LISTING);
  const [createLocation] = useMutation<any>(CREATE_LOCATION);
  const activeTenantId = useTenantStore((s) => s.activeTenantId);

  const [form, setForm] = useState({
    title: "",
    description: "",

    postalCode: "",
    prefecture: "",
    city: "",
    town: "",
    address: "",

    pricePerNight: "",
    numOfBeds: "1",
    numOfBathrooms: "1",
    numOfRooms: "1",
    numOfCustomers: "2",
    categories: "",
    isFeatured: false,
  });

  const [loading, setLoading] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // --- Postal Code Lookup (Japan / zipcloud) ---
  const searchAddress = async (zipcode: string) => {
    const res = await fetch(
      `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode.replace("-", "")}`
    );

    const data = await res.json();
    const result = data.results?.[0];

    if (!result) {
      alert("Address not found");
      return;
    }

    setForm((prev) => ({
      ...prev,
      prefecture: result.address1,
      city: result.address2,
      town: result.address3,
    }));
  };

  const generatePropertyImages = async (listingData: typeof form): Promise<string[]> => {
    const prompts = [
      `${listingData.title || "modern apartment"} exterior view, professional real estate photography, bright daylight`,
      `${listingData.title || "modern apartment"} interior living room, spacious, modern furniture, natural lighting`,
      `${listingData.title || "modern apartment"} bedroom, cozy, clean design, professional photography`,
    ];

    const images: string[] = [];

    for (const prompt of prompts) {
      try {
        const result = await textToImage({
          prompt,
          negative_prompt: "blurry, low quality, distorted, ugly, watermark",
          width: 512,
          height: 512,
          num_inference_steps: 30,
          guidance_scale: 7.5,
        });
        images.push(result.image_url);
      } catch (e) {
        console.error("Image generation failed:", e);
      }
    }

    return images;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!form.prefecture || !form.city || !form.town || !form.address) {
        throw new Error("Please fill in the full address (postal code search + street address).");
      }

      // Step 1: Persist the address as a Location record (prefecture/city/town/street)
      // and use its real id as the listing's locationId.
      setGeneratingImages(true);
      const locationResult = await createLocation({
        variables: {
          input: {
            name: form.address || form.title,
            // zipcloud lookup is Japan-only
            country: "Japan",
            postalCode: form.postalCode || "000-0000",
            prefecture: form.prefecture,
            city: form.city,
            town: form.town,
            address: form.address,
          },
        },
      });

      const locationId = locationResult.data?.createLocation?.location?.id;
      if (!locationId) {
        throw new Error("Failed to create the location record");
      }

      // Step 2: Generate images
      const images = await generatePropertyImages(form);
      setGeneratedImages(images);
      setGeneratingImages(false);

      // Step 3: Create listing with generated images
      const input = {
        tenantId: activeTenantId ?? undefined,
        title: form.title,
        description: form.description,

        pricePerNight: parseFloat(form.pricePerNight) || 0,

        numOfBeds: parseInt(form.numOfBeds) || 1,
        numOfBathrooms: parseInt(form.numOfBathrooms) || 1,
        numOfRooms: parseInt(form.numOfRooms) || 1,
        numOfCustomers: parseInt(form.numOfCustomers) || 2,

        locationId,

        categories: form.categories
          ? form.categories.split(",").map((c) => c.trim())
          : [],

        isFeatured: form.isFeatured,

        pictures: images.map((url) => ({
          objectKey: url,
          mimeType: "image/png",
          size: 0,
        })),
      };

      const result = await createListing({ variables: { input } });
      console.log("Listing created:", result.data?.createListing);

      router.push("/listing");
    } catch (e: any) {
      setError(e.message || "Failed to create listing");
      setGeneratingImages(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Create New Listing</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Beautiful modern apartment in downtown"
              className="w-full border rounded-lg p-3"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your property..."
              className="w-full border rounded-lg p-3 h-24 resize-none"
              required
            />
          </div>

          {/* Property Location */}
          <div className="space-y-3 border rounded-xl p-6 bg-white">
            <h2 className="text-xl font-semibold">Property Location</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Postal Code</label>
              <div className="flex gap-3">
                <input
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="140-0014"
                  className="flex-1 border rounded-lg p-3"
                />
                <button
                  type="button"
                  onClick={() => searchAddress(form.postalCode)}
                  disabled={!form.postalCode}
                  className="bg-blue-600 text-white px-5 rounded-lg disabled:bg-gray-300"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prefecture</label>
                <input
                  value={form.prefecture}
                  readOnly
                  placeholder="東京都"
                  className="w-full border rounded-lg p-3 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  value={form.city}
                  readOnly
                  placeholder="品川区"
                  className="w-full border rounded-lg p-3 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Town</label>
                <input
                  value={form.town}
                  readOnly
                  placeholder="大井"
                  className="w-full border rounded-lg p-3 bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address (street)</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="123 main mansion"
                className="w-full border rounded-lg p-3"
                required
              />
            </div>
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (¥)</label>
              <input
                type="number"
                name="pricePerNight"
                value={form.pricePerNight}
                onChange={handleChange}
                placeholder="10000"
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
                placeholder="5000"
                className="w-full border rounded-lg p-3"
              />
            </div>
          </div>

          {/* Property Details */}
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

          {/* Categories & Featured */}
          <div>
            <label className="block text-sm font-medium mb-1">Categories (comma-separated)</label>
            <input
              type="text"
              name="categories"
              value={form.categories}
              onChange={handleChange}
              placeholder="apartment, modern, city"
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

          {/* Auto-generate images info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Auto-generate images:</strong> 3 property images will be generated automatically using AI based on your listing title and description.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg">{error}</div>
          )}

          {/* Generated Images Preview */}
          {generatedImages.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Generated Images</h3>
              <div className="grid grid-cols-3 gap-2">
                {generatedImages.map((img, i) => (
                  <img key={i} src={img} alt={`Generated ${i + 1}`} className="w-full rounded-lg border" />
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {generatingImages
              ? "Generating Images..."
              : loading
              ? "Creating Listing..."
              : "Create Listing with Auto-Generated Images"}
          </button>
        </form>
      </div>
    </>
  );
}
