// src/wisdom-web/app/components/Footer.tsx
import { Bug, Glasses, Heart, Mail } from "lucide-react";
  
export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">

      {/* Sakura decoration */}
      <div className="pointer-events-none absolute left-10 top-8 text-3xl opacity-30">
        🌸
      </div>

      <div className="pointer-events-none absolute right-16 bottom-10 text-2xl opacity-20">
        ✨
      </div>

      <div className="mx-auto max-w-7xl px-8 py-16">

        {/* Top */}
        <div className="grid gap-12 md:grid-cols-4">

          {/* Logo */}
          <div>

            <h2 className="text-3xl font-bold tracking-wide">
              Wisdom
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              AI Powered Vacation Rentals
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Find beautiful places.
              <br />
              Travel with intelligence.
            </p>

          </div>

          {/* Explore */}

          <div>

            <h3 className="mb-5 font-semibold text-white">
              Explore
            </h3>

            <ul className="space-y-3 text-slate-400">

              <li className="hover:text-white cursor-pointer">
                Featured Listings
              </li>

              <li className="hover:text-white cursor-pointer">
                Categories
              </li>

              <li className="hover:text-white cursor-pointer">
                AI Search
              </li>

              <li className="hover:text-white cursor-pointer">
                Voice Assistant
              </li>

            </ul>

          </div>

          {/* Company */}

          <div>

            <h3 className="mb-5 font-semibold">
              Company
            </h3>

            <ul className="space-y-3 text-slate-400">

              <li className="hover:text-white cursor-pointer">
                About
              </li>

              <li className="hover:text-white cursor-pointer">
                Careers
              </li>

              <li className="hover:text-white cursor-pointer">
                Privacy
              </li>

              <li className="hover:text-white cursor-pointer">
                Contact
              </li>

            </ul>

          </div>

          {/* Social */}

          <div>

            <h3 className="mb-5 font-semibold">
              Connect
            </h3>

            <div className="flex gap-5">

              <Bug
              
                className="cursor-pointer text-slate-400 transition hover:scale-110 hover:text-white"
              />

              <Glasses
                className="cursor-pointer text-slate-400 transition hover:scale-110 hover:text-white"
              />

              <Mail
                className="cursor-pointer text-slate-400 transition hover:scale-110 hover:text-white"
              />

            </div>

            <div className="mt-6 text-sm text-slate-400">
              hello@wisdom.ai
            </div>

          </div>

        </div>

        {/* Divider */}

        <div className="my-10 border-t border-slate-800" />

        {/* Bottom */}

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">

          <p className="text-sm text-slate-500">
            © 2026 Wisdom AI. All Rights Reserved.
          </p>

          <div className="flex items-center gap-2 text-sm text-slate-400">

            Crafted with

            <Heart
              size={16}
              className="fill-pink-500 text-pink-500"
            />

            in Japan 🇯🇵

          </div>

        </div>

      </div>
    </footer>
  );
}