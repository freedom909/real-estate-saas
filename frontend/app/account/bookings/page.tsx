"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { MY_BOOKINGS } from "../../graphql/booking/queries/myBookings";
import { CANCEL_BOOKING } from "../../graphql/booking/mutations/cancelBooking";
import AccountLayout from "../../components/account/AccountLayout";
import Link from "next/link";
import { useState } from "react";

interface Booking {
  id: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  price: number;
  listing?: {
    id: string;
    title: string;
    pictures?: Array<{ url: string }>;
    price: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CHECKED_IN: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
  FAILED: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "確認待ち",
  CONFIRMED: "予約確定",
  CHECKED_IN: "チェックイン済み",
  COMPLETED: "利用完了",
  CANCELLED: "キャンセル済み",
  FAILED: "失敗",
};

export default function AccountBookingsPage() {
  return (
    <AccountLayout>
      <AccountBookingsContent />
    </AccountLayout>
  );
}

function AccountBookingsContent() {
  const { data, loading, error, refetch } = useQuery<{ myBookings: Booking[] }>(MY_BOOKINGS);
  const [cancelBooking] = useMutation(CANCEL_BOOKING, {
    onCompleted: () => refetch(),
  });
  const [filter, setFilter] = useState<string>("ALL");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">Error loading bookings: {error.message}</div>;
  }

  const bookings = data?.myBookings ?? [];

  const filtered = filter === "ALL"
    ? bookings
    : bookings.filter((b) => b.status === filter);

  const handleCancel = async (id: string) => {
    if (!confirm("この予約をキャンセルしますか？")) return;
    setCancellingId(id);
    try {
      await cancelBooking({ variables: { id } });
    } catch (err) {
      console.error("Cancel failed:", err);
    }
    setCancellingId(null);
  };

  const activeCount = bookings.filter((b) => ["PENDING", "CONFIRMED", "CHECKED_IN"].includes(b.status)).length;
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;
  const cancelledCount = bookings.filter((b) => b.status === "CANCELLED").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-sm text-gray-500">View and manage your reservations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => setFilter("ALL")}
          className={`rounded-xl p-4 text-left transition ${filter === "ALL" ? "bg-blue-600 text-white" : "bg-white shadow-sm hover:shadow-md"}`}
        >
          <div className="text-2xl font-bold">{bookings.length}</div>
          <div className="text-sm opacity-75">All</div>
        </button>
        <button
          onClick={() => setFilter("CONFIRMED")}
          className={`rounded-xl p-4 text-left transition ${filter === "CONFIRMED" ? "bg-green-600 text-white" : "bg-white shadow-sm hover:shadow-md"}`}
        >
          <div className="text-2xl font-bold">{activeCount}</div>
          <div className="text-sm opacity-75">Active</div>
        </button>
        <button
          onClick={() => setFilter("COMPLETED")}
          className={`rounded-xl p-4 text-left transition ${filter === "COMPLETED" ? "bg-purple-600 text-white" : "bg-white shadow-sm hover:shadow-md"}`}
        >
          <div className="text-2xl font-bold">{completedCount}</div>
          <div className="text-sm opacity-75">Completed</div>
        </button>
        <button
          onClick={() => setFilter("CANCELLED")}
          className={`rounded-xl p-4 text-left transition ${filter === "CANCELLED" ? "bg-red-600 text-white" : "bg-white shadow-sm hover:shadow-md"}`}
        >
          <div className="text-2xl font-bold">{cancelledCount}</div>
          <div className="text-sm opacity-75">Cancelled</div>
        </button>
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-gray-500 mb-4">No bookings found</p>
          <Link href="/listing" className="text-blue-600 hover:underline">
            Browse listings →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition">
              <img
                src={
                  booking.listing?.pictures?.[0]?.url ||
                  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=120&auto=format&fit=crop"
                }
                alt={booking.listing?.title}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{booking.listing?.title || "Listing"}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABELS[booking.status] || booking.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(booking.checkInDate).toLocaleDateString("ja-JP")} → {new Date(booking.checkOutDate).toLocaleDateString("ja-JP")}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24))}泊
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold">¥{booking.price?.toLocaleString()}</div>
                {["PENDING", "CONFIRMED"].includes(booking.status) && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancellingId === booking.id}
                    className="mt-2 text-xs text-red-600 hover:text-red-800 hover:underline disabled:opacity-50"
                  >
                    {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
