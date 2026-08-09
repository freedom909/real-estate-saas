"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth.store";

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "SUPER_ADMIN" | "MODERATOR" | "OWNER";
}

const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN", "OWNER", "MODERATOR"];

/**
 * Client-side guard: checks if the current user is an admin or owner.
 * Redirects to /dashboard if not authenticated or not authorized.
 */
export default function AdminGuard({ children, requiredRole = "ADMIN" }: AdminGuardProps) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // Wait for Zustand hydration before checking
    if (!_hasHydrated) return;

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    // First check: if the JWT role is OWNER/ADMIN/SUPER_ADMIN, allow immediately
    if (role && ALLOWED_ROLES.includes(role)) {
      setAllowed(true);
      return;
    }

    // Fallback: check via adminUsers query (for legacy admin accounts without role in JWT)
    fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4000/graphql"}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `{ adminUsers { id } }`,
      }),
    })
      .then((res) => res.json())
      .then((result: { data?: { adminUsers: { id: string }[] }; errors?: { message: string }[] }) => {
        if (result.errors?.length) {
          console.error(result.errors);
          router.replace("/dashboard");
          return;
        }

        setAllowed(true);
      })
      .catch((err) => {
        console.error(err);
        router.replace("/dashboard");
      });
  }, [accessToken, router, role, _hasHydrated]);

  // Wait for hydration
  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!accessToken) return null;
  if (!allowed) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Checking admin access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
