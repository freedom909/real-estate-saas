"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { ME } from "../../graphql/auth/auth.queries";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: "/account", label: "Dashboard", icon: "📊" },
  { href: "/account/profile", label: "My Profile", icon: "👤" },
  { href: "/account/bookings", label: "My Bookings", icon: "📅" },
  { href: "/account/sessions", label: "Sessions & Security", icon: "🔒" },
  { href: "/assistant", label: "AI Assistant", icon: "🤖" },
];

const ROLE_BADGE_COLORS: Record<string, string> = {
  CUSTOMER: "bg-blue-100 text-blue-700",
  HOST: "bg-green-100 text-green-700",
  OWNER: "bg-purple-100 text-purple-700",
  STAFF: "bg-gray-100 text-gray-700",
};

export default function AccountSidebar() {
  const pathname = usePathname();
  const { data } = useQuery<any>(ME);
  const me = data?.me;

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">My Account</h2>
        {me?.role && (
          <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE_COLORS[me.role] || "bg-gray-100 text-gray-700"}`}>
            {me.role}
          </span>
        )}
      </div>

      {/* User Info */}
      <div className="mb-6 px-2">
        <div className="flex items-center gap-3">
          {me?.picture ? (
            <img src={me.picture} alt={me.name || "User"} className="h-10 w-10 rounded-full object-cover border-2 border-white" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
              {(me?.name || me?.email || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-sm font-semibold truncate">{me?.name || "User"}</div>
            <div className="text-xs text-gray-400 truncate">{me?.email || ""}</div>
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
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
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>
      </div>
    </aside>
  );
}
