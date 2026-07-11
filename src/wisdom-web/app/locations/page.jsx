"use client";

import React, { useEffect, useState } from 'react';
import client from '@/lib/apolloClient';
import { LIST_LOCATIONS } from '@/graphql/locations';

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const { data } = await client.query({ query: LIST_LOCATIONS });
        setLocations(data?.locations || []);
      } catch (err) {
        console.error('Error loading locations:', err);
        setError('Failed to load locations');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const filtered = locations.filter((loc) => {
    const term = filter.toLowerCase();
    return (
      loc.name?.toLowerCase().includes(term) ||
      loc.city?.toLowerCase().includes(term) ||
      loc.state?.toLowerCase().includes(term) ||
      loc.country?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading locations...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="text-2xl font-bold">🏠 MINSHUKU</a>
            <nav className="space-x-4">
              <a href="/" className="hover:underline">Home</a>
              <a href="/listings" className="hover:underline">Listings</a>
              <a href="/login" className="hover:underline">Login</a>
            </nav>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Explore Locations</h1>
          <p className="text-lg">Discover cities and places available across Minshuku</p>
        </div>
      </div>

      {/* Search */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by name, city, state, or country"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 pb-10">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-600">No locations found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((loc) => (
              <div key={loc.id} className="bg-white rounded-lg shadow p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{loc.name}</h3>
                    <p className="text-gray-600">{loc.city}, {loc.state}</p>
                    <p className="text-gray-500">{loc.country} • {loc.zip}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-700">
                  <p>Lat: {loc.latitude}, Lng: {loc.longitude}</p>
                  <p>Radius: {loc.radius} {loc.units}</p>
                </div>
                <div className="mt-4 flex gap-3">
                  <a href={`/locations/${loc.id}`} className="text-blue-600 hover:underline">View details</a>
                  <a href={`/search?city=${encodeURIComponent(loc.city)}`} className="text-green-600 hover:underline">Search listings</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}