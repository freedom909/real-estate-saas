"use client";

import DashboardSidebar from "../components/shared/DashboardSidebar";
import type { NavItem } from "../components/shared/DashboardSidebar";

const navItems: NavItem[] = [
  { href: "/host", label: "Overview", icon: "📊" },
  { href: "/host/listings", label: "My Listings", icon: "🏠" },
  { href: "/host/listing/new", label: "New Listing", icon: "➕" },
  { href: "/host/bookings", label: "My Bookings", icon: "📅" },
  { href: "/host/revenue", label: "Revenue", icon: "💰" },
  { href: "/host/calendar", label: "Calendar", icon: "📆" },
  { href: "/host/profile", label: "My Profile", icon: "👤" },
];

export default function HostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar
        title="Host Dashboard"
        navItems={navItems}
        accentColor="green"
      />
      <div className="flex-1">
        <header className="bg-white border-b px-8 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-700">Host Dashboard</h1>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            ← Back to Home
          </a>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
