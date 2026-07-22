"use client";

import React, { useEffect, useState } from 'react';
import client from '@/lib/apolloClient';
import { GET_LOCATION } from '@/graphql/locations';

export default function LocationDetailsPage({ params }) {
  const { id } = params;
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        const { data } = await client.query({
          query: GET_LOCATION,
          variables: { locationId: id }
        });
        const loc = data?.locations?.[0] || null;
        setLocation(loc);
        if (!loc) setError('Location not found');
      } catch (err) {
        console.error('Error loading location:', err);
        setError('Failed to load location');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLocation();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading location...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">Location not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="text-2xl font-bold">🏠 MINSHUKU</a>
            <nav className="space-x-4">
              <a href="/locations" className="hover:underline">All Locations</a>
              <a href="/listings" className="hover:underline">Listings</a>
              <a href="/login" className="hover:underline">Login</a>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">{location.name}</h1>
        <p className="text-gray-700 mt-2">{location.address}</p>
        <p className="text-gray-700">{location.city}, {location.state} {location.zip}</p>
        <p className="text-gray-700">{location.country}</p>

        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Geolocation</h2>
          <p className="text-gray-700">Latitude: {location.latitude}</p>
          <p className="text-gray-700">Longitude: {location.longitude}</p>
          <p className="text-gray-700">Radius: {location.radius} {location.units}</p>
        </div>

        <div className="mt-6 flex gap-4">
          <a
            href={`/search?city=${encodeURIComponent(location.city)}`}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            🔍 Search listings in {location.city}
          </a>
          <a
            href="/locations"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
          >
            ← Back to Locations
          </a>
        </div>
      </div>
    </div>
  );
}