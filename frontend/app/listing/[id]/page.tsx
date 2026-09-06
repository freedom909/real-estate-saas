
"use client";

import { useMutation, useQuery, ApolloProvider } from "@apollo/client/react";
import { GET_LISTING } from "@/app/graphql/listing/queries/listing";
import { CREATE_BOOKING } from "@/app/graphql/booking/mutations/createBooking";

import { use } from "react";
import { useState } from "react";
import { client } from "@/app/lib/apolloClient";
import Navbar from "@/app/components/navbar";

type Picture = {
    id: string;
    objectKey: string;
    url: string;
    mimeType: string;
    size: number;
    type: string;
    sortOrder: number;
};

type Listing = {
    id: string;
    title: string;
    description: string;
    address: string;
    price: number;
    pictures: Picture[];
    numOfBeds: number;
    numOfCustomers: number;
};

type GetListingResponse = {
    listing: Listing;
};

export default function ListingDetailPageWrapper(
    params: { params: Promise<{ id: string }> }
) {
    return (
        <ApolloProvider client={client}>
            <ListingDetailPage {...params} />
        </ApolloProvider>
    );
}

function ListingDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);

    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");
    const [selectedImage, setSelectedImage] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const {
        data,
        loading,
        error,
    } = useQuery<GetListingResponse>(
        GET_LISTING,
        {
            variables: {
                id,
            },
        }
    );

    const [
        createBooking,
        {
            loading: bookingLoading,
        },
    ] = useMutation(CREATE_BOOKING);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return (
            <p>
                Error: {error.message}
            </p>
        );
    }

    const listing = data?.listing;

    if (!listing) {
        return (
            <p>
                Listing not found
            </p>
        );
    }
console.log("🔥 DETAIL ADDRESS =", listing.address);
    /*
     * Sort pictures by sortOrder.
     */
    const pictures = [...(listing.pictures ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder
    );

    /*
     * Convert Picture → display URL.
     */
    const getImageUrl = (picture: Picture) => {
        if (picture.url) {
            return picture.url;
        }

        if (picture.objectKey) {
            return picture.objectKey.startsWith("http")
                ? picture.objectKey
                : `http://localhost:9000/listing-images/${picture.objectKey}`;
        }

        return "/placeholder.jpg";
    };

    /*
     * Make sure selectedImage is always valid.
     */
    const safeSelectedImage =
        pictures.length > 0
            ? Math.min(selectedImage, pictures.length - 1)
            : 0;

    const selectedPicture = pictures[safeSelectedImage];

    const selectedImageUrl = selectedPicture
        ? getImageUrl(selectedPicture)
        : "/placeholder.jpg";

    const price = Number(listing.price ?? 0);

    const nights =
        checkInDate && checkOutDate
            ? Math.max(
                1,
                Math.ceil(
                    (
                        new Date(checkOutDate).getTime() -
                        new Date(checkInDate).getTime()
                    ) /
                    (1000 * 60 * 60 * 24)
                )
            )
            : 1;

    const total = price * nights;

    const handleReserve = async () => {
        if (!checkInDate || !checkOutDate) {
            alert("Please select dates");
            return;
        }

        try {
            const result = await createBooking({
                variables: {
                    input: {
                        listingId: id,
                        checkInDate,
                        checkOutDate,
                    },
                },
            });

            console.log(
                "Booking created:",
                result.data
            );

            alert("Booking successful!");

            window.location.href = "/bookings";
        } catch (error) {
            console.error(
                "Booking error:",
                error
            );

            alert("Booking failed");
        }
    };

    return (
        <>
            {/* =====================================================
                LIGHTBOX
            ====================================================== */}

            {isLightboxOpen && pictures.length > 0 && (
                <div
                    className="
                        fixed
                        inset-0
                        z-[9999]
                        bg-black/95
                        flex
                        items-center
                        justify-center
                    "
                    onClick={() => setIsLightboxOpen(false)}
                >

                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={() => setIsLightboxOpen(false)}
                        className="
                            absolute
                            top-6
                            right-6
                            z-20
                            text-white
                            text-4xl
                            w-12
                            h-12
                            flex
                            items-center
                            justify-center
                            rounded-full
                            hover:bg-white/10
                        "
                        aria-label="Close gallery"
                    >
                        ×
                    </button>

                    {/* Counter */}
                    <div
                        className="
                            absolute
                            top-7
                            left-1/2
                            -translate-x-1/2
                            z-20
                            text-white
                            text-sm
                            bg-black/50
                            px-4
                            py-2
                            rounded-full
                        "
                    >
                        {safeSelectedImage + 1} / {pictures.length}
                    </div>

                    {/* Previous */}
                    {pictures.length > 1 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();

                                setSelectedImage(
                                    safeSelectedImage === 0
                                        ? pictures.length - 1
                                        : safeSelectedImage - 1
                                );
                            }}
                            className="
                                absolute
                                left-4
                                md:left-8
                                z-20
                                text-white
                                text-5xl
                                w-14
                                h-14
                                flex
                                items-center
                                justify-center
                                rounded-full
                                hover:bg-white/10
                            "
                            aria-label="Previous image"
                        >
                            ‹
                        </button>
                    )}

                    {/* Lightbox Image */}
                    <div
                        className="
                            relative
                            w-full
                            h-full
                            max-w-6xl
                            flex
                            items-center
                            justify-center
                            px-16
                            md:px-24
                            py-20
                        "
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedImageUrl}
                            alt={`${listing.title} ${safeSelectedImage + 1}`}
                            className="
                                max-w-full
                                max-h-full
                                object-contain
                                rounded-lg
                                select-none
                            "
                        />
                    </div>

                    {/* Next */}
                    {pictures.length > 1 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();

                                setSelectedImage(
                                    safeSelectedImage === pictures.length - 1
                                        ? 0
                                        : safeSelectedImage + 1
                                );
                            }}
                            className="
                                absolute
                                right-4
                                md:right-8
                                z-20
                                text-white
                                text-5xl
                                w-14
                                h-14
                                flex
                                items-center
                                justify-center
                                rounded-full
                                hover:bg-white/10
                            "
                            aria-label="Next image"
                        >
                            ›
                        </button>
                    )}

                </div>
            )}

            <Navbar />

            <div className="max-w-5xl mx-auto p-8">

                {/* =====================================================
                    IMAGE GALLERY
                ====================================================== */}

                {pictures.length > 0 && (
                    <div className="space-y-4">

                        {/* Main Gallery */}
                        <div className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            gap-2
                            h-[500px]
                        ">

                            {/* Main Image */}
                            <button
                                type="button"
                                onClick={() => setIsLightboxOpen(true)}
                                className="
                                    relative
                                    w-full
                                    h-full
                                    overflow-hidden
                                    rounded-2xl
                                    focus:outline-none
                                "
                            >
                                <img
                                    src={selectedImageUrl}
                                    alt={`${listing.title} ${safeSelectedImage + 1}`}
                                    className="
                                        w-full
                                        h-full
                                        object-cover
                                        transition-transform
                                        duration-300
                                        hover:scale-105
                                    "
                                />
                            </button>

                            {/* Right Side Images */}
                            <div className="
                                hidden
                                md:grid
                                grid-rows-2
                                gap-2
                            ">

                                {pictures
                                    .map((picture, index) => ({
                                        picture,
                                        index,
                                    }))
                                    .filter(
                                        ({ index }) =>
                                            index !== safeSelectedImage
                                    )
                                    .slice(0, 2)
                                    .map(
                                        ({
                                            picture,
                                            index,
                                        }) => (
                                            <button
                                                key={
                                                    picture.id ??
                                                    index
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setSelectedImage(
                                                        index
                                                    )
                                                }
                                                className="
                                                    relative
                                                    overflow-hidden
                                                    rounded-2xl
                                                    focus:outline-none
                                                "
                                            >
                                                <img
                                                    src={getImageUrl(
                                                        picture
                                                    )}
                                                    alt={`${listing.title} ${index + 1}`}
                                                    className="
                                                        w-full
                                                        h-full
                                                        object-cover
                                                        transition-transform
                                                        duration-300
                                                        hover:scale-105
                                                    "
                                                />
                                            </button>
                                        )
                                    )}

                            </div>
                        </div>

                        {/* Thumbnail Row */}
                        {pictures.length > 1 && (
                            <div className="
                                flex
                                gap-3
                                overflow-x-auto
                                pb-2
                            ">

                                {pictures.map(
                                    (picture, index) => (
                                        <button
                                            key={
                                                picture.id ??
                                                index
                                            }
                                            type="button"
                                            onClick={() =>
                                                setSelectedImage(
                                                    index
                                                )
                                            }
                                            className={`
                                                flex-shrink-0
                                                w-24
                                                h-20
                                                overflow-hidden
                                                rounded-lg
                                                border-2
                                                transition
                                                focus:outline-none
                                                ${
                                                    safeSelectedImage ===
                                                    index
                                                        ? "border-black"
                                                        : "border-transparent opacity-70 hover:opacity-100"
                                                }
                                            `}
                                        >
                                            <img
                                                src={getImageUrl(
                                                    picture
                                                )}
                                                alt={`${listing.title} thumbnail ${index + 1}`}
                                                className="
                                                    w-full
                                                    h-full
                                                    object-cover
                                                "
                                            />
                                        </button>
                                    )
                                )}

                            </div>
                        )}

                    </div>
                )}

                {/* =====================================================
                    LISTING INFORMATION
                ====================================================== */}

                <h1 className="
                    text-4xl
                    font-bold
                    mt-104
                ">
                    {listing.title}
                </h1>

                <p className="
                    text-gray-500
                    mt-2
                ">
                    {listing.address}
                </p>

                <p className="
                    mt-6
                    text-lg
                    leading-8
                ">
                    {listing.description}
                </p>

                <div className="
                    mt-6
                    text-xl
                ">
                    Beds:
                    {listing.numOfBeds}

                    <br />

                    Guests:
                    {listing.numOfCustomers}
                </div>

                {/* =====================================================
                    PRICE
                ====================================================== */}

                <div className="
                    mt-8
                    text-3xl
                    font-bold
                ">
                    ¥{price.toLocaleString()}
                    / night

                    <div className="
                        text-xl
                        mt-2
                    ">
                        Total:
                        ¥{total.toLocaleString()}
                    </div>
                </div>

                {/* =====================================================
                    BOOKING
                ====================================================== */}

                <div className="
                    mt-10
                    border
                    rounded-xl
                    p-6
                ">

                    <h2 className="
                        text-2xl
                        font-bold
                        mb-6
                    ">
                        Booking
                    </h2>

                    <label className="
                        block
                        mb-2
                    ">
                        Check-in
                    </label>

                    <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) =>
                            setCheckInDate(
                                e.target.value
                            )
                        }
                        className="
                            w-full
                            border
                            rounded-lg
                            p-3
                            mb-5
                        "
                    />

                    <label className="
                        block
                        mb-2
                    ">
                        Check-out
                    </label>

                    <input
                        type="date"
                        value={checkOutDate}
                        onChange={(e) =>
                            setCheckOutDate(
                                e.target.value
                            )
                        }
                        className="
                            w-full
                            border
                            rounded-lg
                            p-3
                            mb-6
                        "
                    />

                    <button
                        onClick={handleReserve}
                        disabled={bookingLoading}
                        className="
                            bg-black
                            text-white
                            px-6
                            py-3
                            rounded-lg
                            disabled:opacity-50
                        "
                    >
                        {bookingLoading
                            ? "Reserving..."
                            : "Reserve"}
                    </button>

                </div>

            </div>
        </>
    );
}
