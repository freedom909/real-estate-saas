"use client";
import { useAuthStore } from "@/app/store/auth.store";
import HeaderClient from "../components/users/ui/HeaderClient";
import CartComponent from "./CartComponent";

export default function CartsPage() {
  const { accessToken, user } = useAuthStore();
  const isLoggedIn = !!accessToken && !!user;

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-semibold">My Cart</h1>
        <HeaderClient />
      </div>
      <div className="p-4">
        {!isLoggedIn ? (
          <div className="p-6">
            <p className="text-red-600">Please log in to view your cart.</p>
            <a href="/login" className="text-blue-600">Go to Login</a>
          </div>
        ) : (
          <CartComponent />
        )}
      </div>
    </div>
  );
}
