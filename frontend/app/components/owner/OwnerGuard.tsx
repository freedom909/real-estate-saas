"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth.store";

const ALLOWED_ROLES = ["OWNER", "ADMIN", "SUPER_ADMIN"];

/**
 * Client-side guard: checks if the current user is an OWNER.
 * Redirects to /dashboard if not authenticated or not authorized.
 */
export default function OwnerGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    if (role && ALLOWED_ROLES.includes(role)) {
      setAllowed(true);
      return;
    }

    // If role not yet available (hydration), wait briefly
    // If still no matching role after hydration, redirect
    const timer = setTimeout(() => {
      if (!role || !ALLOWED_ROLES.includes(role)) {
        router.replace("/dashboard");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [accessToken, router, role]);

  if (!accessToken) return null;
  if (!allowed) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Checking owner access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
