"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { GET_LISTING } from "@/app/graphql/listing/queries/listing";
import { use } from "react";
import { useState } from "react";
import { CREATE_BOOKING } from "@/app/graphql/booking/mutations/createBooking";
import {
  CREATE_CART,
  ADD_TO_CART,
} from "@/app/graphql/cart/mutations/cart";
import { GET_CARTS_BY_CUSTOMER } from "@/app/graphql/cart/queries/cart";
import { useAuthStore } from "@/app/store/auth.store";
import Navbar from "@/app/components/navbar";

type Listing = {
  id: string;
  title: string;
  description: string;
  address: string;
  price: number;
  picture: string[];
  numOfBeds: number;
  numOfCustomers: number;
};

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuthStore();

  const [createBooking, { loading: bookingLoading }] =
    useMutation(CREATE_BOOKING);
  const [createCart] = useMutation(CREATE_CART);
  const [addToCart, { loading: addToCartLoading }] = useMutation(ADD_TO_CART);

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  const { data, loading, error } = useQuery(GET_LISTING, {
    variables: { id },
  });

  const { data: cartData } = useQuery(GET_CARTS_BY_CUSTOMER, {
    variables: { customerId: user?.id },
    skip: !user?.id,
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const listing = (data as any)?.listing as Listing;
  if (!listing) return <p>Listing not found.</p>;
  const price = listing.price || 0;

  const nights =
    checkInDate && checkOutDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(checkOutDate).getTime() -
              new Date(checkInDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 1;

  const total = price * nights;

  const handleReserve = async () => {
    try {
      const result = await createBooking({
        variables: {
          input: {
            listingId: id,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
          },
        },
      });
      console.log("Booking created:", (result as any)?.createBooking);
      alert("Booking successful!");
      window.location.href = "/bookings";
    } catch (error) {
      console.error("Booking error:", error);
      alert("Booking failed");
    }
  };

  const handleAddToCart = async () => {
    if (!user?.id) {
      alert("Please log in to add items to your cart.");
      window.location.href = "/login";
      return;
    }

    try {
      const carts = cartData?.getCartsByCustomer ?? [];
      let cartId = carts[0]?.id;

      if (!cartId) {
        const newCart = await createCart({
          variables: {
            input: {
              customerId: user.id,
              checkInDate: checkInDate || undefined,
              checkOutDate: checkOutDate || undefined,
            },
          },
        });
        cartId = newCart.data?.createCart?.cart?.id;
      }

      if (!cartId) {
        alert("Failed to create cart.");
        return;
      }

      await addToCart({
        variables: {
          input: {
            cartId,
            customerId: user.id,
            listingId: id,
            quantity: 1,
            price: price,
            checkInDate: checkInDate || undefined,
            checkOutDate: checkOutDate || undefined,
          },
        },
      });

      alert("Added to cart!");
      window.location.href = "/carts";
    } catch (err) {
      console.error("Add to cart failed:", err);
      alert("Failed to add to cart.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <img
          src={listing.picture?.[0]}
          alt={listing.title}
          className="w-full h-96 object-cover rounded-xl"
        />

        <h1 className="text-4xl font-bold mt-6">{listing.title}</h1>
        <p className="text-gray-500 mt-2">{listing.address}</p>
        <p className="mt-6 text-lg leading-8">{listing.description}</p>

        <div className="mt-8 text-3xl font-bold">
          ¥{listing.price} / night
        </div>

        <div className="mt-8 p-6 border rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Reserve</h2>

          <div className="mb-4">
            <label className="block mb-2 font-semibold">Check-in</label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-semibold">Check-out</label>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="w-full rounded-lg border p-3"
            />
          </div>

          {checkInDate && checkOutDate && (
            <p className="mb-4 text-gray-600">
              {nights} night{nights !== 1 ? "s" : ""} × ¥{price} ={" "}
              <span className="font-bold">¥{total.toLocaleString()}</span>
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleReserve}
              disabled={bookingLoading}
              className="flex-1 rounded-lg bg-black px-6 py-3 text-white font-semibold disabled:opacity-50 hover:bg-gray-800 transition"
            >
              {bookingLoading ? "Reserving..." : "Reserve Now"}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={addToCartLoading}
              className="flex-1 rounded-lg border-2 border-black px-6 py-3 text-black font-semibold disabled:opacity-50 hover:bg-gray-100 transition"
            >
              {addToCartLoading ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
