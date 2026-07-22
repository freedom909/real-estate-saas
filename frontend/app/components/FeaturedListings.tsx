"use client";

import { useQuery } from "@apollo/client/react";
import { GET_FEATURED_LISTINGS } from "../graphql/listing/queries/featuredListings";
import ListingCard from "./ListingCard";

export default function FeaturedListings() {
  const { data, loading, error } = useQuery(GET_FEATURED_LISTINGS, {
    variables: { limit: 6 },
  });

  if (loading) {
    return (
      <div className="bg-gray-50 p-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Featured Listings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white shadow-md h-80" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 p-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Featured Listings
        </h2>
        <p className="text-gray-500">Unable to load listings.</p>
      </div>
    );
  }

  const listings = data?.featuredListings || [];

  return (
    <div className="bg-gray-50 p-12">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        Featured Listings
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing: any) => (
          <ListingCard
            key={listing.id}
            id={listing.id}
            title={listing.title}
            address={listing.address}
            price={listing.price}
            image={listing.picture?.[0]}
          />
        ))}
      </div>
    </div>
  );
}
