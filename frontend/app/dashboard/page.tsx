"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import Navbar from "@/app/components/navbar";
import Link from "next/link";

/**
 * Role → Dashboard mapping.
 * Staff-level roles (ADMIN, SUPER_ADMIN) can access any dashboard.
 * Each role gets its own dedicated panel.
 */
const ROLE_DASHBOARD_MAP: Record<string, string> = {
  SUPER_ADMIN: "/admin",
  ADMIN: "/admin",
  OWNER: "/owner",
  HOST: "/host",
  AGENT: "/agent",
  STAFF: "/staff",
  MODERATOR: "/moderator",
  CUSTOMER: "/account",
  GUEST: "/account",
};

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.accessToken);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const router = useRouter();

  // Auto-redirect authenticated users to their role dashboard
  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated || !user?.role) return;

    const target = ROLE_DASHBOARD_MAP[user.role];
    if (target) {
      router.replace(target);
    }
  }, [_hasHydrated, isAuthenticated, user?.role, router]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome{user?.name ? `, ${user.name}` : ""}
            </h1>
            <p className="text-gray-500 mt-1">
              {isAuthenticated ? "Redirecting to your dashboard..." : "Please log in to access your dashboard"}
            </p>
          </div>

          {!isAuthenticated ? (
            /* Not logged in */
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-500 mb-4">You&apos;re not logged in yet.</p>
              <Link
                href="/login"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            /* Loading / redirecting */
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="animate-pulse">
                <p className="text-gray-500">Taking you to your {user?.role} dashboard...</p>
              </div>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(ROLE_DASHBOARD_MAP).filter(([role]) => role !== "GUEST").map(([role, path]) => (
                  <Link
                    key={role}
                    href={path}
                    className="text-sm text-blue-600 hover:underline py-2 px-3 rounded-lg hover:bg-blue-50 transition"
                  >
                    → {role.replace("_", " ")}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
