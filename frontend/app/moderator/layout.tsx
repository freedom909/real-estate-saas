"use client";

import DashboardSidebar from "../components/shared/DashboardSidebar";
import type { NavItem } from "../components/shared/DashboardSidebar";

const navItems: NavItem[] = [
  { href: "/moderator", label: "Overview", icon: "📊" },
  { href: "/moderator/reviews", label: "Reviews", icon: "⭐" },
  { href: "/moderator/content", label: "User Content", icon: "📝" },
  { href: "/moderator/reports", label: "Reports", icon: "📋" },
  { href: "/moderator/profile", label: "My Profile", icon: "👤" },
];

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar
        title="Moderator Panel"
        navItems={navItems}
        accentColor="purple"
      />
      <div className="flex-1">
        <header className="bg-white border-b px-8 py-3">
          <h1 className="text-lg font-semibold text-gray-700">Moderator Dashboard</h1>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
