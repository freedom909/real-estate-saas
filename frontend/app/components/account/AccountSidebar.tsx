"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { ME } from "../../graphql/auth/auth.queries";
import { useTenantStore } from "../../store/tenant.store";
import TenantSwitcher from "../TenantSwitcher";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { href: "/account", label: "Dashboard", icon: "📊" },
  { href: "/account/profile", label: "My Profile", icon: "👤" },
  { href: "/account/bookings", label: "My Bookings", icon: "📅" },
  { href: "/account/sessions", label: "Sessions & Security", icon: "🔒" },
  { href: "/account/tenants/new", label: "My Tenants", icon: "🏢" },
  { href: "/account/listing/new", label: "Create Listing", icon: "🏠", roles: ["HOST", "OWNER", "ADMIN", "SUPER_ADMIN"] },
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
  const activeTenantId = useTenantStore((s) => s.activeTenantId);
  const availableTenants = useTenantStore((s) => s.availableTenants);
  const membershipRole = availableTenants.find((t) => t.id === activeTenantId)?.membershipRole;

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
      <div className="mb-4 px-2">
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

      {/* Active Tenant */}
      <ActiveTenantSection />

      <nav className="space-y-1">
        {navItems
          .filter(
            (item) =>
              !item.roles ||
              item.roles.includes(me?.role) ||
              (membershipRole && item.roles.includes(membershipRole))
          )
          .map((item) => {
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

function ActiveTenantSection() {
  const activeTenantId = useTenantStore((s) => s.activeTenantId);
  const availableTenants = useTenantStore((s) => s.availableTenants);
  const activeTenant = availableTenants.find((t) => t.id === activeTenantId);

  return (
    <div className="mb-4 mx-2 p-3 bg-gray-800 rounded-lg">
      <div className="text-xs text-gray-400 mb-1">Active Tenant</div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-green-400 shrink-0" />
        {availableTenants.length > 1 ? (
          <TenantSwitcher dark />
        ) : (
          <span className="text-sm font-medium text-white truncate">
            {activeTenant?.name || "No tenant"}
          </span>
        )}
      </div>
      <Link
        href="/account/tenants/new"
        className="mt-2 flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
      >
        <span>＋</span>
        <span>New Tenant</span>
      </Link>
    </div>
  );
}
