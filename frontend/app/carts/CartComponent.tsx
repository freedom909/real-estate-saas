"use client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useAuthStore } from "@/app/store/auth.store";
import { GET_CARTS_BY_CUSTOMER } from "@/app/graphql/cart/queries/cart";
import {
  UPDATE_CART_ITEM,
  REMOVE_FROM_CART,
  CLEAR_CART,
} from "@/app/graphql/cart/mutations/cart";
import { GET_LISTINGS } from "@/app/graphql/listing/queries/listings";
import { CREATE_BOOKING } from "@/app/graphql/booking/mutations/createBooking";
import { CREATE_PAYMENT } from "@/app/graphql/payment/mutations/payment";

import { useState } from "react";

interface CartItem {
  id: string;
  cartId: string;
  listingId: string;
  quantity: number;
  price: number;
  checkInDate?: string;
  checkOutDate?: string;
}

interface Cart {
  id: string;
  customerId: string;
  price: number;
  checkInDate?: string;
  checkOutDate?: string;
  cartItems: CartItem[];
}

interface Listing {
  id: string;
  title: string;
  description: string;
  address: string;
  ownerId: string;
  price: number;
  picture: string[];
  numOfBeds: number;
  numOfCustomers: number;
}

export default function CartComponent() {
  const { user } = useAuthStore();
  const customerId = user?.id;
  const [checkingOut, setCheckingOut] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const {
    data: cartData,
    loading: cartLoading,
    error: cartError,
    refetch: refetchCart,
  } = useQuery<any>(GET_CARTS_BY_CUSTOMER, {
    variables: { customerId },
    skip: !customerId,
  });

  const {
    data: listingData,
    error: listingError,
  } = useQuery<any>(GET_LISTINGS);

  const [updateCartItem] = useMutation<any>(UPDATE_CART_ITEM);
  const [removeFromCart] = useMutation<any>(REMOVE_FROM_CART);
  const [clearCart] = useMutation<any>(CLEAR_CART);
  const [createBooking] = useMutation<any>(CREATE_BOOKING);
  const [createPayment] = useMutation<any>(CREATE_PAYMENT);

  const listingsMap: Record<string, Listing> = {};
  if (listingData?.listings) {
    for (const l of listingData.listings) {
      listingsMap[l.id] = l;
    }
  }

  const handleQuantityChange = async (item: CartItem, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    try {
      await updateCartItem({
        variables: {
          input: {
            cartId: item.cartId,
            itemId: item.id,
            quantity: newQuantity,
          },
        },
      });
      refetchCart();
    } catch (err) {
      console.error("Failed to update cart item:", err);
    }
  };

  const handleRemove = async (item: CartItem) => {
    setRemovingIds((prev) => new Set(prev).add(item.id));
    try {
      await removeFromCart({
        variables: {
          input: {
            cartId: item.cartId,
            itemId: item.id,
          },
        },
      });
      refetchCart();
    } catch (err) {
      console.error("Failed to remove cart item:", err);
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleClearCart = async (cartId: string) => {
    if (!confirm("Are you sure you want to clear your cart?")) return;
    try {
      await clearCart({ variables: { cartId } });
      refetchCart();
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  const handleCheckout = async (cart: Cart) => {
    if (cart.cartItems.length === 0) return;
    setCheckingOut(true);

    try {
      let lastPaymentId = "";
      let lastBookingId = "";

      for (const item of cart.cartItems) {
        if (!item.checkInDate || !item.checkOutDate) {
          alert(
            `Item "${listingsMap[item.listingId]?.title || item.listingId}" is missing check-in/check-out dates. Please update it before checkout.`
          );
          setCheckingOut(false);
          return;
        }

        const bookingResult = await createBooking({
          variables: {
            input: {
              listingId: item.listingId,
              checkInDate: item.checkInDate,
              checkOutDate: item.checkOutDate,
              price: item.price * item.quantity,
            },
          },
        });

        const bookingId = bookingResult.data?.createBooking?.booking?.id;
        if (bookingId) {
          lastBookingId = bookingId;

          const listing = listingsMap[item.listingId];
          const paymentResult = await createPayment({
            variables: {
              input: {
                bookingId,
                amount: item.price * item.quantity,
                customerId: cart.customerId,
                tenantId: listing?.ownerId || "",
              },
            },
          });
          lastPaymentId = paymentResult.data?.createPayment?.id || "";
        }
      }

      await clearCart({ variables: { cartId: cart.id } });
      refetchCart();

      if (lastPaymentId) {
        window.location.href = `/payments/pay?paymentId=${lastPaymentId}&bookingId=${lastBookingId}`;
      } else {
        window.location.href = "/bookings";
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex gap-4 p-4 border rounded-lg">
            <div className="w-24 h-24 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-1/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!customerId) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Please log in to view your cart.</p>
        <a href="/login" className="text-blue-600 underline mt-2 inline-block">
          Go to Login
        </a>
      </div>
    );
  }

  if (cartError) {
    const isUnauthenticated = cartError.message?.includes("Unauthenticated");
    const isNotFound = cartError.message?.includes("not found");

    return (
      <div className="p-6">
        <p className="text-red-600 font-medium">
          {isUnauthenticated
            ? "Please log in to view your cart."
            : isNotFound
            ? "Cart not found."
            : "Failed to load cart."}
        </p>
        {cartError.message && (
          <p className="text-sm text-gray-500 mt-1">{cartError.message}</p>
        )}
        {isUnauthenticated ? (
          <a href="/login" className="text-blue-600 underline mt-2 inline-block">
            Go to Login
          </a>
        ) : (
          <button
            onClick={() => refetchCart()}
            className="text-blue-600 underline mt-2"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const carts: Cart[] = cartData?.getCartsByCustomer ?? [];

  if (carts.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-xl text-gray-600 mb-2">Your cart is empty</p>
        <p className="text-gray-400 mb-6">
          Browse listings and add properties to your cart.
        </p>
        <a
          href="/listing"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Browse Listings
        </a>
      </div>
    );
  }

  const allItems = carts.flatMap((c) => c.cartItems);
  const totalPrice = allItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalNights = allItems.reduce((sum, item) => {
    if (item.checkInDate && item.checkOutDate) {
      const nights = Math.max(
        1,
        Math.ceil(
          (new Date(item.checkOutDate).getTime() -
            new Date(item.checkInDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      return sum + nights;
    }
    return sum;
  }, 0);

  return (
    <div>
      {carts.map((cart) => (
        <div key={cart.id} className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              {cart.cartItems.length} item{cart.cartItems.length !== 1 ? "s" : ""} in cart
            </h2>
            <button
              onClick={() => handleClearCart(cart.id)}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-4">
            {cart.cartItems.map((item) => {
              const listing = listingsMap[item.listingId];
              const isRemoving = removingIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className={`flex gap-4 p-4 border rounded-lg transition ${
                    isRemoving ? "opacity-50" : ""
                  }`}
                >
                  {listing?.picture?.[0] ? (
                    <img
                      src={listing.picture[0]}
                      alt={listing.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0">
                      No image
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {listing?.title || `Listing ${item.listingId}`}
                        </h3>
                        {listing?.address && (
                          <p className="text-sm text-gray-500 truncate">
                            📍 {listing.address}
                          </p>
                        )}
                      </div>
                      <p className="font-bold text-gray-900 ml-4 whitespace-nowrap">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                      {listing?.numOfBeds != null && (
                        <span>🛏 {listing.numOfBeds} bed{listing.numOfBeds !== 1 ? "s" : ""}</span>
                      )}
                      {listing?.numOfCustomers != null && (
                        <span>👤 up to {listing.numOfCustomers}</span>
                      )}
                    </div>

                    {(item.checkInDate || item.checkOutDate) && (
                      <div className="mt-2 flex gap-4 text-sm text-gray-500">
                        {item.checkInDate && (
                          <span>
                            Check-in:{" "}
                            {new Date(item.checkInDate).toLocaleDateString()}
                          </span>
                        )}
                        {item.checkOutDate && (
                          <span>
                            Check-out:{" "}
                            {new Date(item.checkOutDate).toLocaleDateString()}
                          </span>
                        )}
                        {item.checkInDate && item.checkOutDate && (
                          <span className="text-gray-400">
                            (
                            {Math.max(
                              1,
                              Math.ceil(
                                (new Date(item.checkOutDate).getTime() -
                                  new Date(item.checkInDate).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            )}{" "}
                            night
                            {Math.max(
                              1,
                              Math.ceil(
                                (new Date(item.checkOutDate).getTime() -
                                  new Date(item.checkInDate).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            ) !== 1
                              ? "s"
                              : ""}
                            )
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item, -1)}
                          disabled={item.quantity <= 1 || isRemoving}
                          className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item, 1)}
                          disabled={isRemoving}
                          className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                        <span className="text-sm text-gray-400 ml-2">
                          × ${item.price.toFixed(2)}/night
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemove(item)}
                        disabled={isRemoving}
                        className="text-sm text-red-500 hover:text-red-700 disabled:opacity-40"
                      >
                        {isRemoving ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
              <span>
                {allItems.length} item{allItems.length !== 1 ? "s" : ""} ·{" "}
                {totalNights} night{totalNights !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold">${totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={() => handleCheckout(cart)}
              disabled={checkingOut || allItems.length === 0}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {checkingOut ? "Processing..." : "Checkout"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
