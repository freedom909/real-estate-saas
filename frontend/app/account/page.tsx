"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { ME } from "../graphql/auth/auth.queries";
import { MY_BOOKINGS } from "../graphql/booking/queries/myBookings";
import { BECOME_HOST } from "../graphql/user/mutation/becomeHost";
import AccountLayout from "../components/account/AccountLayout";
import Link from "next/link";
import { useState } from "react";
import { useAuthStore } from "../store/auth.store";

const QUICK_ACTIONS = [
  { href: "/account/profile", label: "My Profile", icon: "👤", color: "bg-blue-50 text-blue-600" },
  { href: "/account/bookings", label: "My Bookings", icon: "📅", color: "bg-green-50 text-green-600" },
  { href: "/account/sessions", label: "Sessions & Security", icon: "🔒", color: "bg-purple-50 text-purple-600" },
  { href: "/assistant", label: "AI Assistant", icon: "🤖", color: "bg-amber-50 text-amber-600" },
  { href: "/listing", label: "Browse Listings", icon: "🏠", color: "bg-cyan-50 text-cyan-600" },
  { href: "/campaign", label: "Campaigns", icon: "📢", color: "bg-rose-50 text-rose-600" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CHECKED_IN: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function AccountPage() {
  return (
    <AccountLayout>
      <AccountDashboardContent />
    </AccountLayout>
  );
}

function AccountDashboardContent() {
  const { data: meData, loading: meLoading } = useQuery<any>(ME);
  const { data: bookingsData, loading: bookingsLoading } = useQuery<any>(MY_BOOKINGS);

  const me = meData?.me;
  const bookings = bookingsData?.myBookings ?? [];

  const activeBookings = bookings.filter((b: any) => ["PENDING", "CONFIRMED", "CHECKED_IN"].includes(b.status));
  const pastBookings = bookings.filter((b: any) => ["COMPLETED", "CANCELLED", "FAILED"].includes(b.status));

  if (meLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome back, {me?.name || "User"} 👋</h1>
        <p className="text-sm text-gray-500">Manage your account, bookings, and settings.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className={`text-2xl p-2 rounded-xl mx-auto w-fit mb-2 ${action.color}`}>
              {action.icon}
            </div>
            <div className="text-sm font-medium text-gray-700">{action.label}</div>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Bookings" value={bookings.length} icon="📅" color="blue" />
        <StatCard title="Active Bookings" value={activeBookings.length} icon="✅" color="green" />
        <StatCard title="Past Bookings" value={pastBookings.length} icon="📋" color="purple" />
      </div>

      {/* Become Host Banner — only for non-host/non-admin users */}
      {me && me.role && me.role !== "HOST" && me.role !== "ADMIN" && me.role !== "SUPER_ADMIN" && (
        <BecomeHostBanner userId={me.id} />
      )}

      {/* Profile Card + Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Profile</h2>
            <Link href="/account/profile" className="text-sm text-blue-600 hover:underline">
              Edit →
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              {me?.picture ? (
                <img src={me.picture} alt={me.name} className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
                  {(me?.name || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-lg font-semibold">{me?.name || "—"}</div>
                <div className="text-sm text-gray-500">{me?.email || "—"}</div>
              </div>
            </div>
            <div className="pt-3 border-t space-y-2 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Role</span>
                <span className="font-medium text-gray-700">{me?.role || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Bookings</h2>
            <Link href="/account/bookings" className="text-sm text-blue-600 hover:underline">
              View All →
            </Link>
          </div>
          {bookingsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">📅</p>
              <p>No bookings yet</p>
              <Link href="/listing" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                Browse listings →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking: any) => (
                <div key={booking.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                  <img
                    src={
                      booking.listing?.pictures?.[0]?.url ||
                      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=100&auto=format&fit=crop"
                    }
                    alt={booking.listing?.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{booking.listing?.title || "Listing"}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(booking.checkInDate).toLocaleDateString()} → {new Date(booking.checkOutDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">¥{booking.price?.toLocaleString()}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-600"}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BecomeHostBanner(_props: { userId: string }) {
  const [becomeHost, { loading, error }] = useMutation<any>(BECOME_HOST, {
    refetchQueries: [{ query: ME }],
  });
  const [success, setSuccess] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const currentUser = useAuthStore((s) => s.user);

  const handleBecomeHost = async () => {
    try {
      const { data } = await becomeHost();
      // Update zustand auth store so navbar reflects new role immediately
      const updatedUser = data?.becomeHost;
      if (updatedUser && currentUser) {
        setUser({
          ...currentUser,
          role: updatedUser.role,
          name: updatedUser.name ?? currentUser.name,
          picture: updatedUser.picture ?? currentUser.picture,
        });
      }
      setSuccess(true);
    } catch {
      // error handled below
    }
  };

  if (success) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🎉</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">You are now a Host!</h3>
            <p className="text-sm text-green-100">
              Welcome to the host community. You can now list your properties and manage bookings.
            </p>
          </div>
          <Link
            href="/admin"
            className="bg-white text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition text-sm"
          >
            Go to Host Panel →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 mb-8 text-white">
      <div className="flex items-center gap-4">
        <div className="text-4xl">🏠</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold">Become a Host</h3>
          <p className="text-sm text-amber-100">
            List your properties, manage bookings, and start earning. Join our host community today!
          </p>
          {error && (
            <p className="text-xs text-red-200 mt-1">{error.message}</p>
          )}
        </div>
        <button
          onClick={handleBecomeHost}
          disabled={loading}
          className="bg-white text-amber-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-amber-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </span>
          ) : (
            "Become a Host →"
          )}
        </button>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`text-2xl p-3 rounded-xl ${colorMap[color] || "bg-gray-50 text-gray-600"}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
