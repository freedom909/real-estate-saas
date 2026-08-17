"use client";
import { useSession } from "next-auth/react";
import HeaderClient from "../components/users/ui/HeaderClient";
import CartComponent from "./CartComponent";

export default function CartsPage() {
  let session: any = null;
  let status = "loading";

  try {
    const result = useSession();
    session = result?.data ?? null;
    status = result?.status ?? "loading";
  } catch {
    // SessionProvider not available (e.g. during build)
    status = "unauthenticated";
  }

  if (status === "loading") {
    return <div className="p-6">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-6">
        <p className="text-red-600">Please log in to view your cart.</p>
        <a href="/login" className="text-blue-600">Go to Login</a>
      </div>
    );
  }

  return (
    <div>
      <HeaderClient />
      <CartComponent />
    </div>
  );
}
