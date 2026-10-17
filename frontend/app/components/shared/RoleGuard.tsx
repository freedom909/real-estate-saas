//frontend/app/components/shared/RoleGuard.tsx


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth.store";
import { useTenantStore } from "../../store/tenant.store";

type AllowedRole =
  | "CUSTOMER"
  | "AGENT"
  | "ADMIN"
  | "SUPER_ADMIN"
  | "OWNER"
  | "STAFF"
  | "MODERATOR"
  | "HOST"
  | "GUEST";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: AllowedRole[];
  fallback?: string;
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallback = "/dashboard",
}: RoleGuardProps) {
  const router = useRouter();

  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  const activeTenantId = useTenantStore((s) => s.activeTenantId);
  const availableTenants = useTenantStore((s) => s.availableTenants);
  const hasSynced = useTenantStore((s) => s.hasSynced);

  const membershipRole = availableTenants.find(
    (tenant) => tenant.id === activeTenantId
  )?.membershipRole;

  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(false);

    if (!hasHydrated) return;

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    // 等待租户同步，避免过早将合法的 HOST/OWNER 重定向。
    if (!hasSynced) return;

    const effectiveRoles: AllowedRole[] = [
      ...(role ? [role as AllowedRole] : []),
      ...(membershipRole ? [membershipRole as AllowedRole] : []),
    ];

    if (effectiveRoles.some((r) => allowedRoles.includes(r))) {
      setAllowed(true);
      return;
    }

    router.replace(fallback);
  }, [
    accessToken,
    role,
    membershipRole,
    activeTenantId,
    hasHydrated,
    hasSynced,
    router,
    allowedRoles,
    fallback,
  ]);

  if (!hasHydrated || (accessToken && !hasSynced)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!accessToken || !allowed) return null;

  return <>{children}</>;
}
