"use client";
import { useSession } from "next-auth/react";
import HeaderClient from "../components/users/ui/HeaderClient";


export default function CartsPage() {
  const { data: session, status } = useSession();

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
    <div className="min-h-screen">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-semibold">My Cart</h1>
        <HeaderClient />
      </div>
      <div className="p-4">
        <CartComponent />
      </div>
    </div>
  );
}