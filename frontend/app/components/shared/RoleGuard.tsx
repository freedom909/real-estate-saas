"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth.store";
import { useTenantStore } from "../../store/tenant.store";
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
  const activeTenantId = useTenantStore((s) => s.activeTenantId);
  const availableTenants = useTenantStore((s) => s.availableTenants);
  const membershipRole = availableTenants.find((tenant) => tenant.id === activeTenantId)?.membershipRole;
   const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!accessToken) {
      router.replace("/login");
      return;
    }

const effectiveRoles: AllowedRole[] = [
  ...(role ? [role as AllowedRole] : []),
  ...(membershipRole ? [membershipRole as AllowedRole] : []),
];

if (effectiveRoles.some((r) => allowedRoles.includes(r))) {
  setAllowed(true);
  return;
}

    // Role doesn't match — redirect to fallback
    router.replace(fallback);
  }, [accessToken, role, membershipRole, activeTenantId,  _hasHydrated, router, allowedRoles, fallback]);

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
