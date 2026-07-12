"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { GET_LISTING } from "app/graphql/listing/queries/listing";
import { use } from "react";
import { useState } from "react";
import { CREATE_BOOKING } from "app/graphql/booking/mutations/createBooking";
import Navbar from "app/components/navbar";
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

type GetListingResponse = {

    listing: Listing;

};

export default function ListingDetailPage({

    params,

}: {

    params: Promise<{ id: string }>;

}) {

    // ✅ 解包 Promise
    const [createBooking, { loading: bookingLoading }] = useMutation(CREATE_BOOKING);
    const { id } = use(params);
    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");
    const [customers, setCustomers] = useState(1);
    const { data, loading, error } = useQuery(GET_LISTING, {

        variables: { id },

    });

    if (loading) return <p>Loading...</p>;

    if (error) return <p>Error: {error.message}</p>;

    const listing = (data as any)?.listing;

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

    return (
        <>
            <Navbar />
            <div className="max-w-4xl mx-auto p-8">

                <img

                    src={listing.picture?.[0]}

                    alt={listing.title}

                    className="w-full h-96 object-cover rounded-xl"

                />
                <div className="p-8">

                    <h1 className="text-3xl font-bold mb-6">Booking</h1>

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

                    <button

                        onClick={() => handleReserve()}

                        disabled={loading}

                        className="rounded-lg bg-black px-6 py-3 text-white disabled:opacity-50"

                    >

                        {loading ? "Reserving..." : "Reserve"}

                    </button>

                </div>
                <h1 className="text-4xl font-bold mt-6">{listing.title}</h1>

                <p className="text-gray-500 mt-2">{listing.address}</p>

                <p className="mt-6 text-lg leading-8">{listing.description}</p>

                <div className="mt-8 text-3xl font-bold">

                    ¥{listing.price} / night
                    ¥{total.toLocaleString()}
                </div>

            </div>
        </>
    );

}
