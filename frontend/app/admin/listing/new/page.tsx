//frontend/app/admin/listing/new/page.tsx
"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";

import { CREATE_LISTING } from "@/app/graphql/listing/mutations/createListing";
import { ALL_CATEGORIES } from "@/app/graphql/category/queries/category";
import { ALL_LOCATIONS } from "@/app/graphql/location/queries/location";
import { GET_TENANTS } from "@/app/graphql/tenant/queries/tenant";

import { textToImage } from "@/app/services/imageGen";
import { Listing } from "@/app/types/listing";

import RoleGuard from "@/app/components/shared/RoleGuard";
import { uploadClient } from "@/app/lib/apolloClient";

import { useTenantStore } from "@/app/store/tenant.store";
import { useAuthStore } from "@/app/store/auth.store";

interface Category {
  id: string;
  name: string;
}

interface CreateListingMutationData {
  createListing: Listing;
}

interface UploadedImage {
  preview: string;
  objectKey: string;
  mimeType: string;
  size: number;
  url?: string;
  file: File;
}

interface LocationItem {
  id: string;
  name: string;
  city: string;
  province: string;
  country: string;
}

interface TenantItem {
  id: string;
  name: string;
  slug: string;
  status: string;
}

type UploadImageResponse = {
  uploadImage: {
    objectKey: string;
    url: string;
    mimeType: string;
    size: number;
  };
};

export default function HostCreateListingPage() {
  return (
    <RoleGuard
      allowedRoles={["HOST",  "OWNER", "ADMIN", "SUPER_ADMIN"]}
    >
      <CreateListingContent />
    </RoleGuard>
  );
}

function CreateListingContent() {
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createListing] =
    useMutation<CreateListingMutationData>(CREATE_LISTING);

  // ============================================================
  // AUTH / TENANT CONTEXT
  // ============================================================

  const user = useAuthStore((state) => state.user);
   console.log("🔥 FRONTEND AUTH USER =", user);
console.log("🔥 FRONTEND USER ROLE =", user?.role);
  const globalRole = user?.role;

  const isGlobalAdmin =
    globalRole === "ADMIN" ||
    globalRole === "SUPER_ADMIN";

  const {
    activeTenantId,
    availableTenants,
  } = useTenantStore();

  const activeTenant = availableTenants.find(
    (tenant) => tenant.id === activeTenantId
  );

  // ============================================================
  // CATEGORIES
  // ============================================================

  const {
    data: categoryData,
  } = useQuery<{ categories: Category[] }>(
    ALL_CATEGORIES
  );

  const categories =
    categoryData?.categories ?? [];

  // ============================================================
  // LOCATIONS
  // ============================================================

  const {
    data: locationData,
  } = useQuery<{
    locations: LocationItem[];
  }>(ALL_LOCATIONS);

  const locations =
    locationData?.locations ?? [];

  // ============================================================
  // TENANTS
  //
  // Only ADMIN / SUPER_ADMIN need the complete tenant list.
  //
  // HOST / OWNER should use activeTenantId from the tenant
  // session instead of choosing a tenant manually.
  // ============================================================

  const {
    data: tenantData,
    loading: tenantsLoading,
    error: tenantsError,
  } = useQuery<{
    getTenants: {
      items: TenantItem[];
      pageInfo: {
        total: number;
        hasNextPage: boolean;
      };
    };
  }>(GET_TENANTS, {
    variables: {
      filter: {
        limit: 100,
        offset: 0,
        status: "ACTIVE",
      },
    },
    skip: !isGlobalAdmin,
  });

  const tenants =
    tenantData?.getTenants?.items ?? [];

  // ============================================================
  // FORM
  // ============================================================

  const [form, setForm] = useState({
    title: "",
    description: "",

    /**
     * Important:
     *
     * ADMIN / SUPER_ADMIN:
     *   form.tenantId = selected target tenant
     *
     * HOST / OWNER:
     *   form.tenantId is ignored during submit
     *   and activeTenantId is used instead.
     */
    tenantId: "",

    locationId: "",

    postalCode: "",
    prefecture: "",
    city: "",
    town: "",

    pricePerNight: "",

    numOfBeds: "1",
    numOfBathrooms: "1",
    numOfRooms: "1",
    numOfCustomers: "2",

    categories: [] as string[],

    isFeatured: false,
  });

  const [loading, setLoading] =
    useState(false);

  const [generatingImages, setGeneratingImages] =
    useState(false);

  const [generatedImages, setGeneratedImages] =
    useState<string[]>([]);

  const [uploadedImages, setUploadedImages] =
    useState<UploadedImage[]>([]);

  const [error, setError] =
    useState<string | null>(null);

  const [isDragOver, setIsDragOver] =
    useState(false);

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
      type,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  // ============================================================
  // LOCATION CHANGE
  // ============================================================

  const handleLocationChange = (
    locationFields: Record<string, string>
  ) => {
    setForm((prev) => ({
      ...prev,
      ...locationFields,
    }));
  };

  // ============================================================
  // AI IMAGE GENERATION
  // ============================================================

  const generatePropertyImages = async (
    listingData: typeof form
  ): Promise<string[]> => {
    const prompts = [
      `${
        listingData.title || "modern apartment"
      } exterior view, professional real estate photography, bright daylight`,

      `${
        listingData.title || "modern apartment"
      } interior living room, spacious, modern furniture, natural lighting`,

      `${
        listingData.title || "modern apartment"
      } bedroom, cozy, clean design, professional photography`,
    ];

    const images: string[] = [];

    for (const prompt of prompts) {
      try {
        const result = await textToImage({
          prompt,
          negative_prompt:
            "blurry, low quality, distorted, ugly, watermark",
          width: 512,
          height: 512,
          num_inference_steps: 30,
          guidance_scale: 7.5,
        });

        images.push(result.image_url);
      } catch (e) {
        console.error(
          "Image generation failed:",
          e
        );
      }
    }

    return images;
  };

  const handleManualGenerate = async () => {
    setGeneratingImages(true);
    setError(null);

    try {
      const images =
        await generatePropertyImages(form);

      setGeneratedImages(images);

      if (images.length === 0) {
        setError(
          "Failed to generate property images."
        );
      }
    } catch (e: any) {
      setError(
        e?.message ||
          "Failed to generate images"
      );
    } finally {
      setGeneratingImages(false);
    }
  };

  // ============================================================
  // FILE UPLOAD
  // ============================================================

  const handleFileUpload = (
    files: FileList | null
  ) => {
    if (!files || files.length === 0) {
      return;
    }

    const imageFiles = Array.from(files).filter(
      (file) =>
        file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      setError(
        "Please select image files only."
      );
      return;
    }

    const newImages: UploadedImage[] =
      imageFiles.map((file) => ({
        preview:
          URL.createObjectURL(file),

        objectKey: "",

        mimeType: file.type,

        size: file.size,

        file,
      }));

    setUploadedImages((prev) => [
      ...prev,
      ...newImages,
    ]);
  };

  const handleDragOver = (
    e: React.DragEvent
  ) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (
    e: React.DragEvent
  ) => {
    e.preventDefault();

    setIsDragOver(false);

    handleFileUpload(
      e.dataTransfer.files
    );
  };

  const removeUploadedImage = (
    index: number
  ) => {
    setUploadedImages((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  const removeGeneratedImage = (
    index: number
  ) => {
    setGeneratedImages((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  // ============================================================
  // POSTAL CODE LOOKUP
  // ============================================================

  const searchAddress = async (
    zipcode: string
  ) => {
    try {
      const res = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`
      );

      if (!res.ok) {
        throw new Error(
          "Postal code lookup failed."
        );
      }

      const data = await res.json();

      const result =
        data.results?.[0];

      if (!result) {
        alert(
          "Address not found"
        );
        return;
      }

      setForm((prev) => ({
        ...prev,

        prefecture:
          result.address1,

        city:
          result.address2,

        town:
          result.address3,
      }));
    } catch (e) {
      console.error(
        "Postal lookup failed:",
        e
      );

      setError(
        "Failed to search address."
      );
    }
  };

  // ============================================================
  // CATEGORIES
  // ============================================================

  function handleCategoryChange(
    event: ChangeEvent<HTMLSelectElement>
  ): void {
    const values = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );

    setForm((prev) => ({
      ...prev,
      categories: values,
    }));
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      // --------------------------------------------------------
      // 1. Validate images
      // --------------------------------------------------------

      const files =
        uploadedImages.map(
          (image) => image.file
        );

      if (
        files.length === 0 &&
        generatedImages.length === 0
      ) {
        setError(
          "Please upload or generate at least one property image."
        );

        return;
      }

      // --------------------------------------------------------
      // 2. Resolve target tenant
      //
      // ADMIN / SUPER_ADMIN:
      //   selected form.tenantId
      //
      // HOST / OWNER:
      //   activeTenantId
      //
      // This mirrors backend authorization:
      //
      // Global Admin -> explicit target tenant
      // Tenant member -> active tenant scope
      // --------------------------------------------------------

      const tenantId =
        isGlobalAdmin
          ? form.tenantId
          : activeTenantId;

      if (!tenantId) {
        throw new Error(
          isGlobalAdmin
            ? "Target tenant is required."
            : "Active tenant is required. Please select an active tenant first."
        );
      }

      // --------------------------------------------------------
      // 3. Build GraphQL input
      // --------------------------------------------------------

      const input: Record<string, any> = {
        title: form.title,

        description:
          form.description,

        pricePerNight:
          parseFloat(
            form.pricePerNight
          ) || 0,

        tenantId,

        numOfBeds:
          parseInt(
            form.numOfBeds
          ) || 1,

        numOfBathrooms:
          parseInt(
            form.numOfBathrooms
          ) || 1,

        numOfRooms:
          parseInt(
            form.numOfRooms
          ) || 1,

        numOfCustomers:
          parseInt(
            form.numOfCustomers
          ) || 2,

        locationId:
          form.locationId ||
          "default-location",

        categories:
          form.categories,

        isFeatured:
          form.isFeatured,

        pictures:
          generatedImages.map(
            (url) => ({
              objectKey: url,
            })
          ),
      };

      // --------------------------------------------------------
      // 4. Add uploaded files when present
      // --------------------------------------------------------

      if (files.length > 0) {
        input.files = files;
      }

      // --------------------------------------------------------
      // 5. Create listing
      // --------------------------------------------------------

      const result =
        await uploadClient.mutate<CreateListingMutationData>(
          {
            mutation:
              CREATE_LISTING,

            variables: {
              input,
            },
          }
        );

      const listing =
        result.data?.createListing;

      if (!listing?.id) {
        throw new Error(
          "Listing was created but no listing ID was returned."
        );
      }

      console.log(
        "✅ LISTING CREATED:",
        listing.id
      );

      console.log(
        "Tenant:",
        tenantId
      );

      console.log(
        "Pictures:",
        listing.pictures?.length
      );

      // --------------------------------------------------------
      // 6. Cleanup local previews
      // --------------------------------------------------------

      uploadedImages.forEach(
        (image) => {
          try {
            URL.revokeObjectURL(
              image.preview
            );
          } catch {
            // Ignore cleanup errors
          }
        }
      );

      setUploadedImages([]);
      setGeneratedImages([]);

      // --------------------------------------------------------
      // 7. Redirect
      // --------------------------------------------------------

      router.push(
        "/host/listings"
      );
    } catch (e: any) {
      console.error(
        "❌ CREATE LISTING ERROR:",
        e
      );

      setError(
        e?.message ||
          "Failed to create listing"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">
        Create New Listing
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        List your property for guests
        to book
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* ================================================== */}
        {/* TITLE */}
        {/* ================================================== */}

        <div>
          <label className="block text-sm font-medium mb-1">
            Title
          </label>

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

        {/* ================================================== */}
        {/* DESCRIPTION */}
        {/* ================================================== */}

        <div>
          <label className="block text-sm font-medium mb-1">
            Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your property..."
            className="w-full border rounded-lg p-3 h-24 resize-none"
            required
          />
        </div>

        {/* ================================================== */}
        {/* PROPERTY LOCATION */}
        {/* ================================================== */}

        <div className="space-y-3 border rounded-xl p-6 bg-white">
          <h2 className="text-xl font-semibold">
            Property Location
          </h2>

          {/* Postal Code */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Postal Code
            </label>

            <div className="flex gap-3">
              <input
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                placeholder="600-8019"
                className="flex-1 border rounded-lg p-3"
              />

              <button
                type="button"
                onClick={() =>
                  searchAddress(
                    form.postalCode
                  )
                }
                disabled={
                  !form.postalCode
                }
                className="bg-blue-600 text-white px-5 rounded-lg disabled:bg-gray-300"
              >
                Search
              </button>
            </div>
          </div>

          {/* Prefecture / City / Town */}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Prefecture
              </label>

              <input
                value={
                  form.prefecture
                }
                readOnly
                className="w-full border rounded-lg p-3 bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                City
              </label>

              <input
                value={form.city}
                readOnly
                className="w-full border rounded-lg p-3 bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Town
              </label>

              <input
                value={form.town}
                readOnly
                className="w-full border rounded-lg p-3 bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* ADDRESS */}
        {/* ================================================== */}

        <div>
          <label className="block text-sm font-medium mb-1">
            Address
          </label>

          <input
            type="text"
            name="locationId"
            value={form.locationId}
            onChange={handleChange}
            placeholder="123 Main St, Tokyo, Japan"
            className="w-full border rounded-lg p-3"
            required
          />
        </div>

        {/* ================================================== */}
        {/* PRICE */}
        {/* ================================================== */}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Price Per Night (¥)
            </label>

            <input
              type="number"
              name="pricePerNight"
              value={
                form.pricePerNight
              }
              onChange={handleChange}
              placeholder="5000"
              className="w-full border rounded-lg p-3"
            />
          </div>
        </div>

        {/* ================================================== */}
        {/* PROPERTY DETAILS */}
        {/* ================================================== */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Beds
            </label>

            <input
              type="number"
              name="numOfBeds"
              value={
                form.numOfBeds
              }
              onChange={handleChange}
              min="1"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Bathrooms
            </label>

            <input
              type="number"
              name="numOfBathrooms"
              value={
                form.numOfBathrooms
              }
              onChange={handleChange}
              min="1"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Rooms
            </label>

            <input
              type="number"
              name="numOfRooms"
              value={
                form.numOfRooms
              }
              onChange={handleChange}
              min="1"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Guests
            </label>

            <input
              type="number"
              name="numOfCustomers"
              value={
                form.numOfCustomers
              }
              onChange={handleChange}
              min="1"
              className="w-full border rounded-lg p-3"
            />
          </div>
        </div>

        {/* ================================================== */}
        {/* TARGET TENANT */}
        {/* ================================================== */}

        <div className="border rounded-xl p-5 bg-white">
          <label className="block text-sm font-medium mb-2">
            Target Tenant
          </label>

          {/* ------------------------------------------------ */}
          {/* GLOBAL ADMIN */}
          {/* ------------------------------------------------ */}

          {isGlobalAdmin ? (
            <>
              {tenantsError && (
                <p className="text-sm text-red-500 mb-2">
                  Failed to load tenants:{" "}
                  {tenantsError.message}
                </p>
              )}

              <select
                name="tenantId"
                value={
                  form.tenantId
                }
                onChange={
                  handleChange
                }
                disabled={
                  tenantsLoading
                }
                required
                className="w-full border rounded-lg p-3"
              >
                <option value="">
                  {tenantsLoading
                    ? "Loading tenants..."
                    : "-- Select a tenant --"}
                </option>

                {tenants.map(
                  (tenant) => (
                    <option
                      key={
                        tenant.id
                      }
                      value={
                        tenant.id
                      }
                    >
                      {tenant.name}{" "}
                      (
                      {
                        tenant.slug
                      }
                      )
                    </option>
                  )
                )}
              </select>

              {tenants.length ===
                0 &&
                !tenantsLoading &&
                !tenantsError && (
                  <p className="text-sm text-red-500 mt-2">
                    No active tenants
                    available.
                  </p>
                )}

              <p className="text-xs text-gray-500 mt-2">
                Global administrators
                may create a listing
                for any active tenant.
              </p>
            </>
          ) : (
            /* ------------------------------------------------ */
            /* HOST / OWNER */
            /* ------------------------------------------------ */

            <>
              <div className="w-full border rounded-lg p-3 bg-gray-100">
                {activeTenant ? (
                  <div>
                    <div className="font-medium">
                      {
                        activeTenant.name
                      }
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      {
                        activeTenant.slug
                      }
                    </div>

                    {activeTenant.membershipRole && (
                      <div className="text-xs text-blue-600 mt-1">
                        Membership Role:{" "}
                        {
                          activeTenant.membershipRole
                        }
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-red-500">
                    No active tenant
                    selected.
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Your listing will be
                created in the currently
                active tenant.
              </p>
            </>
          )}
        </div>

        {/* ================================================== */}
        {/* CATEGORIES */}
        {/* ================================================== */}

        <div>
          <label className="block text-sm font-medium mb-1">
            Categories
          </label>

          <select
            multiple
            value={
              form.categories
            }
            onChange={
              handleCategoryChange
            }
            className="w-full border rounded-lg p-3 h-40"
          >
            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              )
            )}
          </select>

          <p className="text-xs text-gray-500 mt-1">
            Hold Ctrl (Windows) or
            Cmd (Mac) to select
            multiple categories.
          </p>
        </div>

        {/* ================================================== */}
        {/* FEATURED */}
        {/* ================================================== */}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isFeatured"
            checked={
              form.isFeatured
            }
            onChange={
              handleChange
            }
            className="w-4 h-4"
          />

          <label className="text-sm font-medium">
            Featured Listing
          </label>
        </div>

        {/* ================================================== */}
        {/* IMAGE UPLOAD */}
        {/* ================================================== */}

        <div className="border rounded-xl p-6 bg-white space-y-4">
          <h2 className="text-xl font-semibold">
            Property Images
          </h2>

          {/* Upload Zone */}

          <div
            onDragOver={
              handleDragOver
            }
            onDragLeave={
              handleDragLeave
            }
            onDrop={handleDrop}
            onClick={() =>
              fileInputRef.current?.click()
            }
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <p className="text-gray-500">
              📁 Drag & drop images
              here, or{" "}
              <span className="text-blue-600 underline">
                click to browse
              </span>
            </p>

            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, WebP
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) =>
              handleFileUpload(
                e.target.files
              )
            }
            className="hidden"
          />

          {/* Uploaded Images */}

          {uploadedImages.length >
            0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">
                Uploaded Images (
                {
                  uploadedImages.length
                }
                )
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {uploadedImages.map(
                  (img, i) => (
                    <div
                      key={`upload-${i}`}
                      className="relative"
                    >
                      <img
                        src={
                          img.preview
                        }
                        alt={`Upload ${
                          i + 1
                        }`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeUploadedImage(
                            i
                          )
                        }
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* AI Generate */}

          <button
            type="button"
            onClick={
              handleManualGenerate
            }
            disabled={
              generatingImages
            }
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {generatingImages
              ? "Generating..."
              : "✨ Generate AI Photos"}
          </button>

          <p className="text-xs text-gray-500">
            3 property images will
            be generated when you
            use the AI image generator.
          </p>

          {/* Generated Images */}

          {generatedImages.length >
            0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">
                AI Generated Images (
                {
                  generatedImages.length
                }
                )
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {generatedImages.map(
                  (img, i) => (
                    <div
                      key={`gen-${i}`}
                      className="relative"
                    >
                      <img
                        src={img}
                        alt={`Generated ${
                          i + 1
                        }`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeGeneratedImage(
                            i
                          )
                        }
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* ================================================== */}
        {/* SUBMIT */}
        {/* ================================================== */}

        <button
          type="submit"
          disabled={
            loading ||
            generatingImages
          }
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {generatingImages
            ? "Generating Images..."
            : loading
              ? "Creating Listing..."
              : "Create Listing"}
        </button>
      </form>
    </div>
  );
}

