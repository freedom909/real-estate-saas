// src/wisdom-web/app/components/Header.tsx

import Script from "next/script";
import Link from "next/link";
export default function Header() {
  function setOpen(arg0: boolean) {
    throw new Error("Function not implemented.");
  }

  return (
    <header className="bg-slate-900 text-white shadow-md">
<Script
    src="https://accounts.google.com/gsi/client"
    strategy="afterInteractive"
/>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        {/* Logo */}
        <div className="text-3xl font-bold tracking-wide">
          🏠 Wisdom AI
        </div>

        {/* Navigation */}
        <nav className="hidden gap-8 text-lg md:flex">
          <a href="#" className="hover:text-blue-300 transition">
            Home
          </a>

          <a href="#" className="hover:text-blue-300 transition">
            Listings
          </a>

          <a href="#" className="hover:text-blue-300 transition">
            Booking
          </a>

          <a href="#" className="hover:text-blue-300 transition">
            AI Assistant
          </a>
        </nav>

        {/* Right Side */}
        
        <div className="flex items-center gap-4">
          <Link href="/login">
          <button className="rounded-lg border border-white px-5 py-2 hover:bg-white hover:text-slate-900 transition" >
            Login
          </button>
          </Link>
          
          {/* <button className="rounded-lg bg-blue-600 px-5 py-2 hover:bg-blue-700 transition">
            Register
          </button> */}
        </div>
      </div>
    </header>
  );
}