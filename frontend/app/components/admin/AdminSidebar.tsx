"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminPermissions } from "../../hooks/useAdminPermissions";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  permission?: string;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "📊", permission: "dashboard:view" },
  { href: "/admin/users", label: "Admin Users", icon: "🛡️", permission: "admin_users:view" },
  { href: "/admin/manage-users", label: "Users", icon: "👥", permission: "users:view" },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: "📋", permission: "audit_logs:view" },
  { href: "/admin/notifications", label: "Notifications", icon: "🔔", permission: "dashboard:view" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️", permission: "settings:view" },
  { href: "/admin/profile", label: "My Profile", icon: "👤", permission: "profile:view" },
];

const ROLE_BADGE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700",
  ADMIN: "bg-blue-100 text-blue-700",
  MODERATOR: "bg-gray-100 text-gray-700",
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const { role, hasPermission, loading } = useAdminPermissions();

  const visibleItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        {role && (
          <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE_COLORS[role] || "bg-gray-100 text-gray-700"}`}>
            {role.replace("_", " ")}
          </span>
        )}
      </div>

      <nav className="space-y-1">
        {visibleItems.map((item) => {
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
