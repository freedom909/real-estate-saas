"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../../store/auth.store";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: "/owner", label: "Dashboard", icon: "🏠" },
  { href: "/owner/bookings", label: "Bookings", icon: "📅" },
  { href: "/owner/listings", label: "My Listings", icon: "🏡" },
  { href: "/owner/analytics", label: "Analytics", icon: "📈" },
  { href: "/owner/profile", label: "My Profile", icon: "👤" },
];

export default function OwnerSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Owner Panel</h2>
        {user && (
          <p className="mt-1 text-sm text-gray-400 truncate">{user.email}</p>
        )}
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/owner" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-4 border-t border-gray-700">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span>←</span>
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </aside>
  );
}
