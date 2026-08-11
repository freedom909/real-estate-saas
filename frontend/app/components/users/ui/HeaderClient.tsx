// components/HeaderClient.js
"use client";
import React from "react";
import Link from "next/link";
import ProfileMenu from "./ProfilesMenu";
import JoinNowButton from "./JoinNowButton";
import { useAuthStore } from "@/app/store/auth.store";


export default function HeaderClient() {
  const user = useAuthStore((s) => s.user);
  const isLogin = !!user;

  return (
    <div className="flex space-x-4">
      <a href="#" className="underline">Get the Minshuku App</a>
      <Link href="/cart" className="px-3 py-2 rounded bg-blue-800 hover:bg-blue-700 text-white">🛒 Cart</Link>

      {isLogin ? (
        <ProfileMenu />
      ) : (
        <JoinNowButton />
      )}
    </div>
  );
}
