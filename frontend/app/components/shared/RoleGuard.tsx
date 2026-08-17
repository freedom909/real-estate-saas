"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth.store";

type AllowedRole = "CUSTOMER" | "AGENT" | "ADMIN" | "SUPER_ADMIN" | "OWNER" | "STAFF" | "MODERATOR" | "HOST" | "GUEST";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: AllowedRole[];
  fallback?: string; // redirect path if not authorized
}

/**
 * Generic role-based guard. Redirects to /login if not authenticated,
 * or to `fallback` if the user's role is not in `allowedRoles`.
 */
export default function RoleGuard({ children, allowedRoles, fallback = "/dashboard" }: RoleGuardProps) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    if (role && allowedRoles.includes(role as AllowedRole)) {
      setAllowed(true);
      return;
    }

    // Role doesn't match — redirect to fallback
    router.replace(fallback);
  }, [accessToken, role, _hasHydrated, router, allowedRoles, fallback]);

  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!accessToken || !allowed) return null;

  return <>{children}</>;
}
