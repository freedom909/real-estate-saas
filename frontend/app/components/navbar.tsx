// Navbar.tsx

"use client";

import Link from "next/link";

import { useAuthStore } from "@/app/store/auth.store";

import { logout as authLogout } from "@/app/services/auth.service";

import TenantSwitcher from "./TenantSwitcher";

export default function Navbar() {

  const user = useAuthStore((s) => s.user);

  // logout() in auth.service.ts handles redirect
  const logout = () => authLogout();

  return (

    <nav className="border-b bg-black">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">

        <div className="flex items-center gap-8">

          <Link href="/" className="text-2xl font-bold tracking-wide">

            🏠 Wisdom AI

          </Link>

          <div className="hidden items-center gap-6 md:flex">

            <Link href="/" className="hover:text-blue-600 transition">

              Home

            </Link>

            <Link href="/listing" className="hover:text-blue-600 transition">

              Listings

            </Link>

            <Link href="/bookings" className="hover:text-blue-600 transition">

              Bookings

            </Link>

            <Link href="/assistant" className="hover:text-blue-600 transition">

              AI Assistant

            </Link>

            <Link href="/campaign" className="hover:text-blue-600 transition">

              Campaign

            </Link>

            {user && (
              <Link href="/admin" className="hover:text-red-600 transition text-red-400 font-semibold">

                Admin

              </Link>
            )}

          </div>

        </div>

        <div className="flex items-center gap-4">

          {user ? (

            <>

              <TenantSwitcher />

              <div className="flex items-center gap-3">

                {user.picture ? (

                  <img

                    src={user.picture}

                    alt={user.name || "User"}

                    className="h-9 w-9 rounded-full object-cover border-2 border-white"

                  />

                ) : (

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">

                    {(user.name || user.email || "U").charAt(0).toUpperCase()}

                  </div>

                )}

                <div className="text-right">

                  <div className="font-semibold">

                    {user.name || user.email || "User"}

                  </div>

                  {user.email && (

                    <div className="text-sm text-gray-500">

                      {user.email}

                    </div>

                  )}

                </div>

              </div>

              <button

                onClick={logout}

                className="rounded-lg border px-3 py-2 hover:bg-gray-100"

              >

                Logout

              </button>

            </>

          ) : (

            <Link href="/login">

              <button className="rounded-lg border border-white px-5 py-2 hover:bg-white hover:text-slate-900 transition">

                Login

              </button>

            </Link>

          )}

        </div>

      </div>

    </nav>

  );

}
