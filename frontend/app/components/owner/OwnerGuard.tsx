"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth.store";

/**
 * Client-side guard: checks if the current user is authenticated.
 * Redirects to /login if not authenticated.
 * All authenticated users can access owner pages (OWNER, ADMIN, SUPER_ADMIN, etc.)
 */
export default function OwnerGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    // Wait for Zustand hydration before checking
    if (!_hasHydrated) return;

    if (!accessToken) {
      router.replace("/login");
      return;
    }
  }, [accessToken, _hasHydrated, router]);

  // Wait for hydration
  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!accessToken) return null;

  return <>{children}</>;
}
