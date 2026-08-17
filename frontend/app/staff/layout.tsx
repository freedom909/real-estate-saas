"use client";

import DashboardSidebar from "../components/shared/DashboardSidebar";
import type { NavItem } from "../components/shared/DashboardSidebar";

const navItems: NavItem[] = [
  { href: "/staff", label: "Overview", icon: "📊" },
  { href: "/staff/bookings", label: "Bookings", icon: "📅" },
  { href: "/staff/listings", label: "Listings", icon: "🏠" },
  { href: "/staff/operations", label: "基本運営", icon: "⚙️" },
  { href: "/staff/profile", label: "My Profile", icon: "👤" },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar
        title="Staff Panel"
        navItems={navItems}
        accentColor="gray"
      />
      <div className="flex-1">
        <header className="bg-white border-b px-8 py-3">
          <h1 className="text-lg font-semibold text-gray-700">Staff Dashboard</h1>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
