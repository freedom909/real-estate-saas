"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import Navbar from "app/components/navbar";
import { BOOKING_BY_ID } from "app/graphql/booking/queries/bookingById";
import { CANCEL_BOOKING } from "app/graphql/booking/mutations/cancelBooking";
import { CONFIRM_BOOKING } from "app/graphql/booking/mutations/confirmBooking";
import { CHECK_IN_BOOKING } from "app/graphql/booking/mutations/checkInBooking";
import { COMPLETE_BOOKING } from "app/graphql/booking/mutations/completeBooking";
import PaymentStatusBadge from "app/payments/paymentStatus.badge";
import { useParams } from "next/navigation";
import { useState } from "react";

interface BookingQueryData {
  booking: {
    id: string;
    price: number;
    status: string;
    checkInDate: string;
    checkOutDate: string;
    listing: {
      price: number;
      title: string;
      picture?: string[];
    };
    payment?: {
      id: string;
      status: string;
      amount: number;
    };
  };
}

export default function BookingDetailPage() {
  const params = useParams();
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [completing, setCompleting] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const { data, loading, error, refetch } = useQuery<BookingQueryData>(BOOKING_BY_ID, {
    variables: { id: params.id },
    context: { headers: { 'Authorization': token } },
  });

  const [cancelBooking] = useMutation(CANCEL_BOOKING, {
    context: { headers: { 'Authorization': token } },
    onCompleted: () => {
      refetch();
      setCancelling(false);
    },
    onError: () => {
      setCancelling(false);
    },
  });

  const [confirmBooking] = useMutation(CONFIRM_BOOKING, {
    context: { headers: { 'Authorization': token } },
    onCompleted: () => {
      refetch();
      setConfirming(false);
    },
    onError: () => {
      setConfirming(false);
    },
  });

  const [checkInBooking] = useMutation(CHECK_IN_BOOKING, {
    context: { headers: { 'Authorization': token } },
    onCompleted: () => {
      refetch();
      setCheckingIn(false);
    },
    onError: () => {
      setCheckingIn(false);
    },
  });

  const [completeBooking] = useMutation(COMPLETE_BOOKING, {
    context: { headers: { 'Authorization': token } },
    onCompleted: () => {
      refetch();
      setCompleting(false);
    },
    onError: () => {
      setCompleting(false);
    },
  });

  const booking = data?.booking;

  const handleCancel = async () => {
    if (!booking || cancelling) return;
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(true);
    await cancelBooking({ variables: { id: booking.id } });
  };

  const handleConfirm = async () => {
    if (!booking || confirming) return;
    setConfirming(true);
    await confirmBooking({ variables: { id: booking.id } });
  };

  const handleCheckIn = async () => {
    if (!booking || checkingIn) return;
    setCheckingIn(true);
    await checkInBooking({ variables: { id: booking.id } });
  };

  const handleComplete = async () => {
    if (!booking || completing) return;
    setCompleting(true);
    await completeBooking({ variables: { id: booking.id } });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-8 bg-gray-500">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-3xl font-bold text-white">Booking Detail</h1>
            <div className="animate-pulse rounded-2xl border bg-gray-300 shadow-md h-96" />
          </div>
        </div>
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <Navbar />
        <div className="p-8 bg-gray-500">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-3xl font-bold text-white">Booking Detail</h1>
            <div className="rounded-2xl border bg-white p-8 text-center">
              <p className="text-gray-500">Booking not found.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="p-8 bg-gray-500">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-3xl font-bold text-white">Booking Detail</h1>
          <div className="overflow-hidden rounded-2xl border bg-gray-300 shadow-md">
            <img
              src={
                booking?.listing?.picture?.[0] ||
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop"
              }
              className="h-72 w-full object-cover"
            />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <PaymentStatusBadge status={(booking?.payment?.status as "PENDING" | "PAID" | "FAILED" | "REFUNDED") || "PENDING"} />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Price per night</p>
                <p className="text-2xl font-bold">
                  {(() => {
                    const nights = 
                       Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24))
                     const pricePerNight =booking.price / nights;
                    if (nights && nights > 0 && booking?.price != null) {
                      return `¥${pricePerNight.toLocaleString()}`;
                    }
                    return booking?.listing?.price != null 
                      ? `¥${booking.listing.price.toLocaleString()}`
                      : "-";
                  })()}
                </p>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{booking?.listing?.title || "Untitled Listing"}</h2>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  booking?.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                  booking?.status === "CHECKED_IN" ? "bg-indigo-100 text-indigo-700" :
                  booking?.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                  booking?.status === "COMPLETED" ? "bg-blue-100 text-blue-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {booking?.status || "PENDING"}
                </span>
              </div>
              <div className="space-y-3 text-gray-600">
                <p><strong>Booking ID:</strong> {params.id}</p>
                <p><strong>Check-in:</strong> {booking?.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : "-"}</p>
                <p><strong>Check-out:</strong> {booking?.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : "-"}</p>
                <p><strong>Nights:</strong> {booking?.checkInDate && booking?.checkOutDate
                  ? Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24))
                  : "-"} nights</p>
              </div>
              <div className="my-6 border-t pt-6">
                <div className="flex items-center justify-between text-lg">
                  <span>Total Amount</span>
                  <span className="text-3xl font-bold">
                    {booking?.price != null
                      ? `¥${booking.price.toLocaleString()}`
                      : "-"}
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <h3 className="mb-2 font-semibold">Cancellation Policy</h3>
                <p className="text-sm text-gray-600">
                  Free cancellation until 48 hours before check-in.
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                <button className="flex-1 rounded-xl bg-black py-3 font-semibold text-white">
                  Contact Host
                </button>
                {booking?.status === "PENDING" && (
                  <button
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {confirming ? "Confirming..." : "Confirm Booking"}
                  </button>
                )}
                {booking?.status === "CONFIRMED" && (
                  <button
                    onClick={handleCheckIn}
                    disabled={checkingIn}
                    className="flex-1 rounded-xl bg-indigo-600 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {checkingIn ? "Checking in..." : "Check In"}
                  </button>
                )}
                {booking?.status === "CHECKED_IN" && (
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {completing ? "Completing..." : "Complete Stay"}
                  </button>
                )}
                <button
                  onClick={handleCancel}
                  disabled={cancelling || booking?.status === "CANCELLED" || booking?.status === "COMPLETED" || booking?.status === "CHECKED_IN"}
                  className="flex-1 rounded-xl border py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
