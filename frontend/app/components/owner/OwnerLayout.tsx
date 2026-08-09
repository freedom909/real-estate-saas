"use client";

import OwnerSidebar from "./OwnerSidebar";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <OwnerSidebar />
      <div className="flex-1">
        <header className="bg-white border-b px-8 py-3">
          <h1 className="text-lg font-semibold text-gray-700">Owner Dashboard</h1>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
