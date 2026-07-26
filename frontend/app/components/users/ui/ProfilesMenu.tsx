'use client';
import { useAuthStore } from "@/app/store/auth.store";
import { logout } from "@/app/services/auth.service";
import Link from 'next/link';
import { useState } from 'react';

export default function ProfileMenu() {
  const { user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center space-x-2 bg-blue-800 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors"
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt="User avatar"
            width={32}
            height={32}
            onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
        <span className="text-sm font-medium text-white">{user.name}</span>
        <svg
          className={`w-4 h-4 text-white transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            📊 Dashboard
          </Link>
          <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            👤 Profile Settings
          </Link>
          <Link href="/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            📅 My Bookings
          </Link>
          <div className="border-t my-1"></div>
          <button
            onClick={() => logout()}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}
