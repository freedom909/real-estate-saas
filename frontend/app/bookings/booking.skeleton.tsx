"use client";

export function BookingSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white hover:shadow-lg transition">
      <div className="flex flex-col md:flex-row">
        <div className="w-full h-56 bg-gray-200 animate-pulse md:w-80" />
        <div className="flex-1 p-5 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
