"use client";

import { useState } from "react";

export interface LocationFormValue {
  postalCode: string;
  prefecture: string;
  city: string;
  town: string;
  street: string;
  building: string;
  country: string;
}

interface Props {
  value: LocationFormValue;
  onChange: (value: LocationFormValue) => void;
}

export default function LocationForm({
  value,
  onChange,
}: Props) {
  const [loading, setLoading] = useState(false);

  const update = (field: keyof LocationFormValue, val: string) => {
    onChange({
      ...value,
      [field]: val,
    });
  };

  const searchPostalCode = async () => {
    if (!value.postalCode) {
      alert("Please enter postal code.");
      return;
    }

    setLoading(true);

    try {
      const zipcode = value.postalCode.replace("-", "");

      const res = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`
      );

      const json = await res.json();

      if (!json.results || json.results.length === 0) {
        alert("Postal code not found.");
        return;
      }

      const result = json.results[0];

      onChange({
        ...value,
        prefecture: result.address1,
        city: result.address2,
        town: result.address3,
      });

    } catch (err) {
      console.error(err);
      alert("Failed to search address.");
    }

    setLoading(false);
  };

  const fullAddress =
    value.prefecture +
    value.city +
    value.town +
    value.street +
    value.building;

  return (
    <div className="space-y-5 border rounded-xl p-6 bg-white">

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
            value={value.postalCode}
            onChange={(e) =>
              update("postalCode", e.target.value)
            }
            placeholder="6008019"
            className="flex-1 border rounded-lg p-3"
          />

          <button
            type="button"
            onClick={searchPostalCode}
            disabled={loading}
            className="bg-blue-600 text-white px-5 rounded-lg"
          >
            {loading ? "Searching..." : "Search"}
          </button>

        </div>

      </div>

      {/* Prefecture */}

      <div>

        <label className="block text-sm font-medium mb-2">
          Prefecture
        </label>

        <input
          value={value.prefecture}
          readOnly
          className="w-full border rounded-lg p-3 bg-gray-100"
        />

      </div>

      {/* City */}

      <div>

        <label className="block text-sm font-medium mb-2">
          City
        </label>

        <input
          value={value.city}
          readOnly
          className="w-full border rounded-lg p-3 bg-gray-100"
        />

      </div>

      {/* Town */}

      <div>

        <label className="block text-sm font-medium mb-2">
          Town
        </label>

        <input
          value={value.town}
          readOnly
          className="w-full border rounded-lg p-3 bg-gray-100"
        />

      </div>

      {/* Street */}

      <div>

        <label className="block text-sm font-medium mb-2">
          Street Number
        </label>

        <input
          value={value.street}
          onChange={(e) =>
            update("street", e.target.value)
          }
          placeholder="1-2-3"
          className="w-full border rounded-lg p-3"
        />

      </div>

      {/* Building */}

      <div>

        <label className="block text-sm font-medium mb-2">
          Building / Apartment
        </label>

        <input
          value={value.building}
          onChange={(e) =>
            update("building", e.target.value)
          }
          placeholder="ABC Mansion 301"
          className="w-full border rounded-lg p-3"
        />

      </div>

      {/* Country */}

      <div>

        <label className="block text-sm font-medium mb-2">
          Country
        </label>

        <input
          value={value.country}
          onChange={(e) =>
            update("country", e.target.value)
          }
          className="w-full border rounded-lg p-3"
        />

      </div>

      {/* Preview */}

      <div className="bg-gray-50 rounded-lg p-4">

        <p className="text-sm text-gray-500 mb-2">
          Full Address
        </p>

        <p className="font-medium">
          {fullAddress || "-"}
        </p>

      </div>

    </div>
  );
}