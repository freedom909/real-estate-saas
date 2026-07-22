"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth.store";

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "SUPER_ADMIN" | "MODERATOR";
}

/**
 * Client-side guard: checks if the current user is an admin.
 * Redirects to /dashboard if not authenticated or not an admin.
 */
export default function AdminGuard({ children, requiredRole = "ADMIN" }: AdminGuardProps) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    // Check if user is admin via adminUsers query
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
      .then((data) => {
        if (data.errors) {
          router.replace("/dashboard");
        } else {
          setAllowed(true);
        }
      })
      .catch(() => {
        router.replace("/dashboard");
      });
  }, [accessToken, router]);

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
