"use client";

import DashboardSidebar from "../components/shared/DashboardSidebar";
import type { NavItem } from "../components/shared/DashboardSidebar";

const navItems: NavItem[] = [
  { href: "/agent", label: "Overview", icon: "📊" },
  { href: "/agent/customers", label: "Customers", icon: "👥" },
  { href: "/agent/bookings", label: "Bookings", icon: "📅" },
  { href: "/agent/listings", label: "Listings", icon: "🏠" },
  { href: "/agent/profile", label: "My Profile", icon: "👤" },
];

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar
        title="Agent Panel"
        navItems={navItems}
        accentColor="cyan"
      />
      <div className="flex-1">
        <header className="bg-white border-b px-8 py-3">
          <h1 className="text-lg font-semibold text-gray-700">Agent Dashboard</h1>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
