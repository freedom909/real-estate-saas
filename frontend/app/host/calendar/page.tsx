"use client";

import RoleGuard from "../../components/shared/RoleGuard";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { useState, useCallback, useMemo } from "react";

const CALENDAR_DATA = gql`
  query HostCalendar {
    myBookings {
      id
      status
      checkInDate
      checkOutDate
      price
      createdAt
      listing { id title }
      user { id name email }
    }
    myListings {
      id
      title
      pictures { url }
    }
  }
`;

const ACTIVE_STATUSES = new Set(["PENDING", "CONFIRMED", "CHECKED_IN"]);

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  CONFIRMED:  { bg: "bg-green-100",  text: "text-green-800" },
  PENDING:    { bg: "bg-yellow-100", text: "text-yellow-800" },
  CHECKED_IN: { bg: "bg-blue-100",   text: "text-blue-800" },
  COMPLETED:  { bg: "bg-gray-100",   text: "text-gray-600" },
  CANCELLED:  { bg: "bg-red-50",     text: "text-red-400" },
};

/* ─── Types ─── */
interface BookingSlotInfo {
  booking: any;
  isCheckIn: boolean;
  isCheckOut: boolean;
  isMidStay: boolean;
}

/* ─── Page ─── */
export default function HostCalendarPage() {
  return (
    <RoleGuard allowedRoles={["HOST", "OWNER", "ADMIN", "SUPER_ADMIN"]}>
      <HostCalendarContent />
    </RoleGuard>
  );
}

function HostCalendarContent() {
  const { data, loading, error } = useQuery<any>(CALENDAR_DATA);
  const bookings = data?.myBookings ?? [];
  const listings = data?.myListings ?? [];

  // Modal state (lifted up so all calendars share it)
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const handleDoubleClick = useCallback((booking: any) => setSelectedBooking(booking), []);
  const closeModal = useCallback(() => setSelectedBooking(null), []);

  // Group bookings by listingId
  const bookingsByListing = useMemo(() => {
    const map: Record<string, any[]> = {};
    bookings.forEach((b: any) => {
      const lid = b.listing?.id;
      if (!lid) return;
      if (!map[lid]) map[lid] = [];
      map[lid].push(b);
    });
    return map;
  }, [bookings]);

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">カレンダー</h1>
          <p className="text-sm text-gray-500">ご予約の確認 — 物件ごとにカレンダーを表示</p>
        </div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, j) => (
                  <div key={j} className="h-16 bg-gray-100 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">カレンダー</h1>
        <p className="text-sm text-gray-500">ご予約の確認 — 物件ごとにカレンダーを表示 · ダブルクリックで詳細</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-700 font-medium">⚠️ Failed to load calendar data</p>
          <p className="text-xs text-red-500 mt-1">{error.message}</p>
        </div>
      )}

      {listings.length === 0 && !loading && !error ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <span className="text-4xl">🏠</span>
          <p className="mt-3 text-gray-500">まだ物件が登録されていません。</p>
        </div>
      ) : (
        <div className="space-y-8">
          {listings.map((listing: any) => (
            <ListingCalendar
              key={listing.id}
              listing={listing}
              bookings={bookingsByListing[listing.id] || []}
              onBookingDoubleClick={handleDoubleClick}
            />
          ))}
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal booking={selectedBooking} onClose={closeModal} />
      )}
    </div>
  );
}

/* ─── Single Listing Calendar ─── */
function ListingCalendar({
  listing,
  bookings,
  onBookingDoubleClick,
}: {
  listing: any;
  bookings: any[];
  onBookingDoubleClick: (b: any) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleString("ja-JP", { month: "long", year: "numeric" });

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  // Build per-date booking slots for THIS listing only
  const bookingsByDate: Record<string, BookingSlotInfo[]> = {};

  bookings.forEach((b: any) => {
    if (!b.checkInDate || !b.checkOutDate) return;

    const start = new Date(b.checkInDate);
    const end = new Date(b.checkOutDate);
    const current = new Date(start);

    while (current <= end) {
      const key = current.toISOString().substring(0, 10);
      if (!bookingsByDate[key]) bookingsByDate[key] = [];

      const isSameDay = start.toDateString() === end.toDateString();
      const isCheckIn = current.toDateString() === start.toDateString();
      const isCheckOut = current.toDateString() === end.toDateString();

      bookingsByDate[key].push({
        booking: b,
        isCheckIn: isSameDay ? true : isCheckIn,
        isCheckOut: isSameDay ? true : isCheckOut,
        isMidStay: !isCheckIn && !isCheckOut,
      });

      current.setDate(current.getDate() + 1);
    }
  });

  // Detect overbooked dates (same listing, >1 active booking on same day)
  const overbookedDates = useMemo(() => {
    const result: Record<string, number> = {};
    for (const [dateStr, slots] of Object.entries(bookingsByDate)) {
      const activeSlots = slots.filter((s) => ACTIVE_STATUSES.has(s.booking.status));
      if (activeSlots.length > 1) {
        result[dateStr] = activeSlots.length;
      }
    }
    return result;
  }, [bookingsByDate]);

  const hasOverbookings = Object.keys(overbookedDates).length > 0;

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Listing Header */}
      <div className={`px-6 py-4 border-b ${hasOverbookings ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🏠</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{listing.title}</h2>
              <p className="text-xs text-gray-500">
                {bookings.length}件の予約
              </p>
            </div>
          </div>
          {hasOverbookings && (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
              ⚠️ 重複予約
            </span>
          )}
        </div>
      </div>

      {/* Month Navigation */}
      <div className="px-6 pt-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="px-3 py-1 rounded-lg hover:bg-gray-100 transition text-sm">← 前月</button>
          <h3 className="text-sm font-semibold text-gray-700">{monthName}</h3>
          <button onClick={nextMonth} className="px-3 py-1 rounded-lg hover:bg-gray-100 transition text-sm">翌月 →</button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day headers */}
          {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
            <div key={d} className={`text-center text-[10px] font-medium py-1 ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
            }`}>{d}</div>
          ))}

          {/* Calendar cells */}
          {days.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const slots = bookingsByDate[dateStr] || [];
            const isToday = new Date().toISOString().substring(0, 10) === dateStr;
            const overbookCount = overbookedDates[dateStr];
            const isOverbooked = !!overbookCount;

            return (
              <div
                key={dateStr}
                onDoubleClick={() => {
                  if (slots.length === 1) {
                    onBookingDoubleClick(slots[0].booking);
                  } else if (slots.length > 1) {
                    onBookingDoubleClick(slots[0].booking);
                  }
                }}
                className={`min-h-[5rem] p-1 rounded-lg border text-[10px] relative cursor-pointer select-none transition ${
                  isOverbooked
                    ? "border-red-400 bg-red-50"
                    : isToday
                      ? "border-blue-400 bg-blue-50"
                      : slots.length > 0
                        ? "border-gray-300 bg-gray-50/50 hover:shadow-sm"
                        : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {/* Day number */}
                <div className={`font-medium mb-0.5 flex items-center justify-between ${
                  isOverbooked ? "text-red-700" : isToday ? "text-blue-600" : "text-gray-600"
                }`}>
                  <span className={isToday ? "bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]" : ""}>
                    {day}
                  </span>
                  {isOverbooked && <span className="text-xs" title={`${overbookCount} active bookings!`}>❌</span>}
                </div>

                {/* Guest chips — only guest name, no listing name needed (it's the header) */}
                <div className="space-y-px">
                  {slots.slice(0, 3).map((slot, i) => {
                    const b = slot.booking;
                    const guestName = b.user?.name || "Guest";
                    const colors = STATUS_COLORS[b.status] || STATUS_COLORS.COMPLETED;
                    const isConflict = isOverbooked && ACTIVE_STATUSES.has(b.status);

                    return (
                      <div
                        key={`${b.id}-${i}`}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          onBookingDoubleClick(b);
                        }}
                        className={`rounded px-1 py-px text-[10px] leading-tight truncate ${
                          isConflict
                            ? "bg-red-200 text-red-800 font-semibold ring-1 ring-red-300"
                            : `${colors.bg} ${colors.text}`
                        }`}
                        title={`${guestName}${isConflict ? " ⚠️ 重複" : ""}\nダブルクリックで詳細`}
                      >
                        <span className="font-medium">{guestName}</span>
                        {slot.isCheckIn && !slot.isCheckOut && (
                          <span className="ml-0.5 text-[8px] opacity-70">▶</span>
                        )}
                        {slot.isCheckOut && !slot.isCheckIn && (
                          <span className="ml-0.5 text-[8px] opacity-70">■</span>
                        )}
                        {slot.isCheckIn && slot.isCheckOut && (
                          <span className="ml-0.5 text-[8px] opacity-70">1日</span>
                        )}
                      </div>
                    );
                  })}
                  {slots.length > 3 && (
                    <div className="text-[9px] text-gray-400 pl-1">他 {slots.length - 3} 件</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend (compact, per calendar) */}
      <div className="px-6 pb-4 flex items-center gap-3 text-[10px] text-gray-400 flex-wrap">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-100 border border-green-200" /> 確定</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-100 border border-yellow-200" /> 仮予約</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-100 border border-blue-200" /> チェックイン済</span>
        <span className="flex items-center gap-1"><span className="text-green-600 font-bold">▶</span> チェックイン</span>
        <span className="flex items-center gap-1"><span className="text-gray-600 font-bold">■</span> チェックアウト</span>
      </div>
    </div>
  );
}

/* ─── Booking Detail Modal ─── */
function BookingDetailModal({ booking, onClose }: { booking: any; onClose: () => void }) {
  const b = booking;
  const colors = STATUS_COLORS[b.status] || STATUS_COLORS.COMPLETED;

  const checkIn = b.checkInDate ? new Date(b.checkInDate) : null;
  const checkOut = b.checkOutDate ? new Date(b.checkOutDate) : null;

  let nights = 0;
  if (checkIn && checkOut) {
    nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">予約詳細</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
              {b.status}
            </span>
            <span className="text-xs text-gray-400">#{b.id?.slice(0, 8)}</span>
          </div>

          {/* Guest */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">ゲスト</label>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{b.user?.name || "—"}</p>
            <p className="text-xs text-gray-500">{b.user?.email || "—"}</p>
          </div>

          {/* Listing */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">物件</label>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{b.listing?.title || "—"}</p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">チェックイン</label>
              <p className="text-sm font-medium text-gray-900 mt-0.5">
                {checkIn ? checkIn.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" }) : "—"}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">チェックアウト</label>
              <p className="text-sm font-medium text-gray-900 mt-0.5">
                {checkOut ? checkOut.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" }) : "—"}
              </p>
            </div>
          </div>

          {/* Duration & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">宿泊数</label>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{nights}泊</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">料金</label>
              <p className="text-sm font-medium text-gray-900 mt-0.5">¥{(b.price || 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Created */}
          {b.createdAt && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">予約日時</label>
              <p className="text-sm text-gray-700 mt-0.5">
                {new Date(b.createdAt).toLocaleString("ja-JP")}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
