"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../../store/auth.store";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface DashboardSidebarProps {
  title: string;
  navItems: NavItem[];
  backHref?: string;
  backLabel?: string;
  accentColor?: string; // e.g. "green" for HOST, "blue" for ADMIN
}

const ACCENT_MAP: Record<string, { bg: string; badge: string }> = {
  green:  { bg: "bg-green-600", badge: "bg-green-100 text-green-700" },
  blue:   { bg: "bg-blue-600",  badge: "bg-blue-100 text-blue-700" },
  purple: { bg: "bg-purple-600", badge: "bg-purple-100 text-purple-700" },
  amber:  { bg: "bg-amber-600", badge: "bg-amber-100 text-amber-700" },
  red:    { bg: "bg-red-600",   badge: "bg-red-100 text-red-700" },
  gray:   { bg: "bg-gray-600",  badge: "bg-gray-100 text-gray-700" },
  cyan:   { bg: "bg-cyan-600",  badge: "bg-cyan-100 text-cyan-700" },
  rose:   { bg: "bg-rose-600",  badge: "bg-rose-100 text-rose-700" },
  indigo: { bg: "bg-indigo-600", badge: "bg-indigo-100 text-indigo-700" },
};

export default function DashboardSidebar({
  title,
  navItems,
  backHref = "/dashboard",
  backLabel = "Back to Dashboard",
  accentColor = "blue",
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const accent = ACCENT_MAP[accentColor] || ACCENT_MAP.blue;

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold">{title}</h2>
        {user?.role && (
          <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${accent.badge}`}>
            {user.role.replace("_", " ")}
          </span>
        )}
      </div>

      {/* User Info */}
      {user && (
        <div className="mb-6 px-2">
          <div className="flex items-center gap-3">
            {user.picture ? (
              <img src={user.picture} alt={user.name || "User"} className="h-10 w-10 rounded-full object-cover border-2 border-white" />
            ) : (
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${accent.bg} text-white text-sm font-bold`}>
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{user.name || "User"}</div>
              <div className="text-xs text-gray-400 truncate">{user.email || ""}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== backHref && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? `${accent.bg} text-white`
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Back Link */}
      <div className="mt-8 pt-4 border-t border-gray-700 space-y-1">
        <Link
          href={backHref}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span>&#8592;</span>
          <span>{backLabel}</span>
        </Link>
        {user?.role === "SUPER_ADMIN" && (
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
          >
            <span>&#128682;</span>
            <span>Back to Home</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
