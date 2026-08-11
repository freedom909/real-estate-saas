"use client";

import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_PAYMENT } from "@/app/graphql/payment/queries/payment";
import { BOOKING_BY_ID } from "@/app/graphql/booking/queries/bookingById";
import { CONFIRM_PAYMENT } from "@/app/graphql/payment/mutations/payment";
import { useAuthStore } from "@/app/store/auth.store";
import Navbar from "@/app/components/navbar";
import StripeProvider from "../stripe-provider";
import PaymentForm from "../payment-form";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const bookingId = searchParams.get("bookingId");
  const { user } = useAuthStore();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [creatingIntent, setCreatingIntent] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const { data: paymentData, loading: paymentLoading } = useQuery<any>(GET_PAYMENT, {
    variables: { id: paymentId },
    skip: !paymentId,
  });

  const { data: bookingData, loading: bookingLoading } = useQuery<any>(BOOKING_BY_ID, {
    variables: { id: bookingId },
    skip: !bookingId,
  });

  const [confirmPayment] = useMutation<any>(CONFIRM_PAYMENT);

  const payment = paymentData?.payment || {}; // Property 'payment' does not exist on type '{}'.
  const booking = bookingData?.booking || {}; // Property 'booking' does not exist on type '{}'.

  useEffect(() => {
    if (payment && payment.status === "PENDING" && !clientSecret && !creatingIntent) {
      createPaymentIntent();
    }
  }, [payment]);

  const createPaymentIntent = async () => {
    if (!payment) return;
    setCreatingIntent(true);
    setIntentError(null);

    try {
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payment.amount,
          currency: "usd",
          paymentId: payment.id,
          bookingId: payment.bookingId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create payment intent");
      }

      setClientSecret(data.clientSecret);
    } catch (err: any) {
      setIntentError(err.message || "Failed to initialize payment");
    } finally {
      setCreatingIntent(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setPaymentSuccess(true);
    if (paymentId) {
      try {
        await confirmPayment({ variables: { paymentId } });
      } catch (err) {
        console.error("Failed to confirm payment:", err);
      }
    }
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
  };

  const loading = paymentLoading || bookingLoading;

  if (!paymentId) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No payment specified</h2>
            <p className="text-gray-500 mb-6">Please start from a booking or cart.</p>
            <Link href="/bookings" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              View Bookings
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading payment details...</div>
        </div>
      </>
    );
  }

  if (paymentSuccess) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-green-600 font-bold">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your payment of ${payment?.amount.toFixed(2)} has been processed.</p>
            <div className="space-y-3">
              {booking && (
                <Link
                  href={`/bookings/${booking.id}`}
                  className="block w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  View Booking
                </Link>
              )}
              <Link
                href="/payments"
                className="block w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Payment History
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Payment Header */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-4">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Complete Payment</h1>

            {booking && (
              <div className="flex gap-3 mb-4">
                {booking.listing?.picture?.[0] && (
                  <img
                    src={booking.listing.picture[0]}
                    alt={booking.listing.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{booking.listing?.title || "Untitled"}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.checkInDate).toLocaleDateString()} → {new Date(booking.checkOutDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-gray-900">${payment?.amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Stripe Payment Form */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            {intentError ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-red-600">✕</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Initialization Failed</h3>
                <p className="text-sm text-gray-500 mb-4">{intentError}</p>
                <button
                  onClick={createPaymentIntent}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Try Again
                </button>
              </div>
            ) : creatingIntent || !clientSecret ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-500">Initializing secure payment...</p>
              </div>
            ) : (
              <StripeProvider clientSecret={clientSecret}>
                <PaymentForm
                  amount={payment?.amount || 0}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </StripeProvider>
            )}
          </div>

          {/* Back Link */}
          <div className="text-center mt-4">
            <Link href="/bookings" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to bookings
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PaymentPage() {
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
      <PaymentPageContent />
    </Suspense>
  );
}
