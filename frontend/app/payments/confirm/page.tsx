"use client";

import { useQuery } from "@apollo/client/react";
import { useSearchParams } from "next/navigation";
import { GET_PAYMENT } from "@/app/graphql/payment/queries/payment";
import { BOOKING_BY_ID } from "@/app/graphql/booking/queries/bookingById";
import Navbar from "@/app/components/navbar";
import Link from "next/link";
import { Suspense } from "react";

const STATUS_CONFIG = {
  SUCCEEDED: {
    icon: "✓",
    title: "Payment Successful",
    subtitle: "Your payment has been processed successfully.",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    titleColor: "text-green-800",
    textColor: "text-green-700",
  },
  PROCESSING: {
    icon: "...",
    title: "Processing Payment",
    subtitle: "Your payment is being processed. Please wait.",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    titleColor: "text-blue-800",
    textColor: "text-blue-700",
  },
  PENDING: {
    icon: "⏳",
    title: "Payment Pending",
    subtitle: "Your payment is awaiting processing.",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    titleColor: "text-yellow-800",
    textColor: "text-yellow-700",
  },
  FAILED: {
    icon: "✕",
    title: "Payment Failed",
    subtitle: "Unfortunately, your payment could not be processed.",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    titleColor: "text-red-800",
    textColor: "text-red-700",
  },
  CANCELLED: {
    icon: "⊘",
    title: "Payment Cancelled",
    subtitle: "This payment has been cancelled.",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
    titleColor: "text-gray-800",
    textColor: "text-gray-700",
  },
  REFUNDED: {
    icon: "↩",
    title: "Payment Refunded",
    subtitle: "This payment has been refunded.",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    titleColor: "text-purple-800",
    textColor: "text-purple-700",
  },
};

function PaymentConfirmContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const bookingId = searchParams.get("bookingId");

  const { data: paymentData, loading: paymentLoading } = useQuery<any>(GET_PAYMENT, {
    variables: { id: paymentId },
    skip: !paymentId,
  });

  const { data: bookingData, loading: bookingLoading } = useQuery<any>(BOOKING_BY_ID, {
    variables: { id: bookingId },
    skip: !bookingId,
  });

  const loading = paymentLoading || bookingLoading;
  const payment = paymentData?.payment || {}; // Property 'payment' does not exist on type '{}'.
  const booking = bookingData?.booking || {}; // Property 'booking' does not exist on type '{}'.
  const status = payment?.status || "PENDING";
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Status Card */}
          <div className={`rounded-2xl border ${config.borderColor} ${config.bgColor} shadow-sm overflow-hidden`}>
            {/* Icon */}
            <div className="flex justify-center pt-8">
              <div className={`w-20 h-20 rounded-full ${config.iconBg} flex items-center justify-center`}>
                <span className={`text-4xl ${config.iconColor} font-bold`}>
                  {config.icon}
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="text-center px-6 pt-4 pb-2">
              <h1 className={`text-2xl font-bold ${config.titleColor}`}>
                {config.title}
              </h1>
              <p className={`mt-2 ${config.textColor}`}>
                {config.subtitle}
              </p>
            </div>

            {/* Payment Details */}
            {payment && (
              <div className="mx-6 my-4 bg-white rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment ID</span>
                  <span className="font-mono text-gray-900">{payment.id.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-semibold text-gray-900">${payment.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-semibold ${config.textColor}`}>{status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="text-gray-900">
                    {new Date(payment.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            )}

            {/* Booking Details */}
            {booking && (
              <div className="mx-6 mb-4 bg-white rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 text-sm">Booking Details</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Listing</span>
                  <span className="text-gray-900 text-right max-w-[200px] truncate">
                    {booking.listing?.title || "Untitled"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Check-in</span>
                  <span className="text-gray-900">
                    {new Date(booking.checkInDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Check-out</span>
                  <span className="text-gray-900">
                    {new Date(booking.checkOutDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-gray-900">${booking.price.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && !payment && (
              <div className="mx-6 mb-4 bg-white rounded-xl p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            )}

            {/* Not Found */}
            {!loading && !payment && paymentId && (
              <div className="mx-6 mb-4 bg-white rounded-xl p-4 text-center">
                <p className="text-gray-500">Payment not found.</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            {booking && (
              <Link
                href={`/bookings/${booking.id}`}
                className="block w-full text-center py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                View Booking
              </Link>
            )}
            <Link
              href="/payments"
              className="block w-full text-center py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              View Payment History
            </Link>
            <Link
              href="/"
              className="block w-full text-center py-3 text-gray-500 hover:text-gray-700 transition"
            >
              Back to Home
            </Link>
          </div>

          {/* Retry for failed payments */}
          {status === "FAILED" && booking && (
            <div className="mt-4">
              <Link
                href={`/bookings/${booking.id}`}
                className="block w-full text-center py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Try Payment Again
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function PaymentConfirmPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </>
      }
    >
      <PaymentConfirmContent />
    </Suspense>
  );
}
