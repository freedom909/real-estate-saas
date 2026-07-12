// Navbar.tsx

"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

type User = {

  id: string;

  email?: string;

  name?: string;

  picture?: string;

};

export default function Navbar() {

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {

    const raw = localStorage.getItem("user");

    console.log("LOCAL USER =", raw);

    if (raw) {

      setUser(JSON.parse(raw));

    }

  }, []);

  const logout = () => {

    localStorage.removeItem("accessToken");

    localStorage.removeItem("refreshToken");

    localStorage.removeItem("user");

    window.location.href = "/";

  };

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
                      <Link href="/dashboard" className="hover:text-blue-600 transition">

              Dashboard

            </Link>

                        <Link href="/campaign" className="hover:text-blue-600 transition">

              Campaign

            </Link>
          </div>

        </div>

        <div className="flex items-center gap-4">

          {user ? (

            <>

              <div className="text-right">

                <div className="font-semibold">

                  👤 {user.name || user.email || "User"}

                </div>

                {user.email && (

                  <div className="text-sm text-gray-500">

                    {user.email}

                  </div>

                )}

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
          <button className="rounded-lg border border-white px-5 py-2 hover:bg-white hover:text-slate-900 transition" >
            Login
          </button>
          </Link>

          )}

        </div>

      </div>

    </nav>

  );

}