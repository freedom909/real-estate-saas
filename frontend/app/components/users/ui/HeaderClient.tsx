// components/HeaderClient.js
"use client";
import React from "react";
import { useAuthStore } from "@/app/store/auth.store";
import Link from "next/link";
import ProfileMenu from "./ProfilesMenu";
import JoinNowButton from "./JoinNowButton";

export default function HeaderClient() {
  const { accessToken, user } = useAuthStore();
  const isLoggedIn = !!accessToken && !!user;

  return (
    <div className="flex space-x-4">
      <a href="#" className="underline">Get the Minshuku App</a>
      <Link href="/carts" className="px-3 py-2 rounded bg-blue-800 hover:bg-blue-700 text-white">🛒 Cart</Link>

      {isLoggedIn ? (
        <ProfileMenu />
      ) : (
        <JoinNowButton />
      )}
    </div>
  );
}
