"use client";

import { useQuery } from "@apollo/client/react";
import { GET_LOCATION_BY_ID } from "@/app/graphql/location/queries/location";

type LocationParts = {
  id: string;
  name: string;
  country: string;
  postalCode: string;
  prefecture: string;
  city: string;
  town: string;
  address: string;
};

/**
 * Resolve a listing's locationId to the human-readable address
 * (prefecture + city + town + street, same format as the listing detail page).
 * Never renders the raw locationId — it is an opaque UUID.
 */
export default function LocationAddress({
  locationId,
  className,
}: {
  locationId?: string | null;
  className?: string;
}) {
  const { data, loading } = useQuery<{ locations: LocationParts[] }>(
    GET_LOCATION_BY_ID,
    {
      variables: { locationId },
      skip: !locationId,
    }
  );

  if (!locationId) return null;

  const location = data?.locations?.[0];
  if (!location) {
    return <span className={className}>{loading ? "" : "-"}</span>;
  }

  return (
    <span className={className}>
      {location.prefecture}
      {location.city}
      {location.town} {location.address}
    </span>
  );
}
