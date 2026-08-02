"use client";

import { useQuery } from "@apollo/client/react";
import { useAuthStore } from "@/app/store/auth.store";
import { GET_PAYMENTS_BY_CUSTOMER } from "@/app/graphql/payment/queries/payment";
import Navbar from "@/app/components/navbar";
import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
  SUCCEEDED: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-gray-100 text-gray-600",
};

export default function PaymentsPage() {
  const { user } = useAuthStore();

  const { data, loading, error } = useQuery(GET_PAYMENTS_BY_CUSTOMER, {
    variables: { customerId: user?.id },
    skip: !user?.id,
  });

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold">Please login</h2>
            <p className="mb-6 text-gray-600">You must be logged in to view payments.</p>
            <a href="/login" className="inline-block rounded-lg bg-black px-6 py-3 text-white">
              Go to Login
            </a>
          </div>
        </div>
      </>
    );
  }

  const payments = data?.paymentsByCustomer ?? [];

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Payment History</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-lg border p-4">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-48" />
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="h-5 bg-gray-200 rounded w-20" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700 font-medium">Failed to load payments</p>
            <p className="text-red-600 text-sm mt-1">{error.message}</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">💳</div>
            <p className="text-xl text-gray-600 mb-2">No payments yet</p>
            <p className="text-gray-400 mb-6">Your payment history will appear here after you make a booking.</p>
            <Link href="/listing" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment: any) => (
              <div key={payment.id} className="rounded-lg border bg-white p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Payment #{payment.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Booking: {payment.bookingId.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(payment.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </p>
                    <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[payment.status] || "bg-gray-100 text-gray-700"}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>

                {payment.status === "PENDING" && (
                  <div className="mt-3 pt-3 border-t flex gap-3">
                    <Link
                      href={`/payments/pay?paymentId=${payment.id}&bookingId=${payment.bookingId}`}
                      className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Pay Now
                    </Link>
                    <Link
                      href={`/bookings/${payment.bookingId}`}
                      className="text-sm text-blue-600 hover:underline py-2"
                    >
                      View booking →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
