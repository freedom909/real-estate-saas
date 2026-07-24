"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { CREATE_LISTING } from "@/app/graphql/listing/mutations/createListing";
import { textToImage } from "@/app/services/imageGen";
import Navbar from "@/app/components/navbar";

export default function CreateListingPage() {
  const router = useRouter();
  const [createListing] = useMutation(CREATE_LISTING);

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
      // Step 1: Generate images
      setGeneratingImages(true);
      const images = await generatePropertyImages(form);
      setGeneratedImages(images);
      setGeneratingImages(false);

      // Step 2: Create listing with generated images
      const input = {
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
        categories: form.categories ? form.categories.split(",").map((c) => c.trim()) : [],
        isFeatured: form.isFeatured,
        picture: images,
        ownerId: "current-user", // Replace with actual user ID
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

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="123 Main St, Tokyo, Japan"
              className="w-full border rounded-lg p-3"
              required
            />
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (¥)</label>
              <input
                type="number"
                name="price"
                value={form.price}
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

          {/* Location & Categories */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Location ID</label>
              <input
                type="text"
                name="locationId"
                value={form.locationId}
                onChange={handleChange}
                placeholder="location-id"
                className="w-full border rounded-lg p-3"
              />
            </div>
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
          </div>

          {/* Featured */}
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
