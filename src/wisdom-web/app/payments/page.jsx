"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { GET_PAYMENTS_BY_GUEST } from "@/graphql/payments";
import HeaderClient from "@/components/ui/HeaderClient";
import HostNavigation from "@/components/HostNavigation";
import Wallet from "@/components/Wallet";

export default function PaymentsPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("payments");

  const { data, loading, error } = useQuery(GET_PAYMENTS_BY_GUEST, {
    variables: { guestId: session?.user?.id },
    skip: !session?.user?.id
  });

  const payments = data?.paymentsByGuest || [];

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center items-center h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-4">You must be logged in to view payments.</p>
            <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "SUCCEEDED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner */}
      <div className="bg-blue-900 text-white px-4 py-2 text-sm flex justify-between items-center">
        <div className="flex space-x-4">
          <span>trusted</span>
          <span>unforgotten</span>
        </div>
        <div className="flex space-x-4">
          <HeaderClient />
          <HostNavigation />
        </div>
      </div>

      {/* Header */}
      <header className="bg-blue-800 text-white px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold">🏠 MINSHUKU</div>
        <nav className="space-x-4">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/listings" className="hover:underline">Listings</Link>
          <Link href="/search" className="hover:underline">Search</Link>
          <Link href="/bookings" className="hover:underline">Bookings</Link>
          <Link href="/orders" className="hover:underline">Orders</Link>
          <Link href="/payments" className="hover:underline font-semibold">Payments</Link>
          <Link href="/profile" className="hover:underline">Profile</Link>
        </nav>
        <div className="text-sm">
          Welcome, {session.user?.name || session.user?.email}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payments & Wallet</h1>
          <p className="text-gray-600">Manage your payments and wallet balance</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("payments")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "payments"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Payment History
            </button>
            <button
              onClick={() => setActiveTab("wallet")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "wallet"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Wallet
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "payments" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
              <div className="text-sm text-gray-500">
                {payments.length} payment{payments.length !== 1 ? 's' : ''} found
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading payments...</div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-700 font-medium">Error loading payments</div>
                <div className="text-red-600 text-sm">{error.message}</div>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No payments found</div>
                <div className="text-sm text-gray-400 mt-2">
                  Your payment history will appear here after you make payments
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-900">
                          Payment #{payment.id.slice(-8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Order: {payment.orderId}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg text-green-600">
                          ¥{payment.amount.toFixed(2)}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Date:</span> {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Payment ID:</span> {payment.paymentIntentId?.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "wallet" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Wallet Management</h2>
            <Wallet />
          </div>
        )}
      </div>
    </div>
  );
}