// components/HeaderClient.js
"use client";
import React from "react";
import { useCookie } from "next-auth/react";
import Link from "next/link";
import ProfileMenu from "./ProfilesMenu";
import JoinNowButton from "./JoinNowButton";


export default function HeaderClient() {
  const token = useCookie("token");
  const isLogin = !!token;

  return (
    <div className="flex space-x-4">
      <a href="#" className="underline">Get the Minshuku App</a>
      <Link href="/cart" className="px-3 py-2 rounded bg-blue-800 hover:bg-blue-700 text-white">🛒 Cart</Link>

      {isLogin ? (
        <ProfileMenu token={token} />
      ) : (
        <JoinNowButton />
      )}
    </div>
  );
}
