// src/wisdom-web/app/ListingPage.tsx

"use client";

import Link from "next/link";
import Image from "next/image";

import { useQuery, ApolloProvider } from "@apollo/client/react";

import { GET_LISTINGS } from "../graphql/listing/queries/listings";

import Navbar from "../components/navbar";

import { Listing } from "../types/listing";
import { listingClient } from "../lib/listingClient";


export default function ListingPageWrapper() {
  return (
    <ApolloProvider client={listingClient}>
      <ListingPage />
    </ApolloProvider>
  );
}

function ListingPage() {
  const {
    data,
    loading,
    error
  } = useQuery(GET_LISTINGS, {

    variables: {
      limit: 10,
      offset: 0,
    },

  });


  if (loading) {
    return (
      <>
        <Navbar />

        <div className="p-8">
          Loading listings...
        </div>
      </>
    );
  }


  if (error) {

    return (
      <>
        <Navbar />

        <div className="p-8 text-red-500">
          Error: {error.message}
        </div>

      </>

    );

  }


  return (

    <>

      <Navbar />


      <div className="p-8">


        <h1 className="text-3xl font-bold mb-6">
          Listings
        </h1>



        <div className="
            grid 
            grid-cols-1 
            md:grid-cols-2 
            lg:grid-cols-3 
            gap-6
          "
        >
          {

            data?.listings?.map((listing: Listing) => {

              const cover =listing.pictures?.find((picture) => picture.sortOrder === 0);
                return (
                  <div
                    key={listing.id}
                    className="
                      border 
                      rounded-xl 
                      overflow-hidden
                      shadow
                      bg-white
                    "
                  >


                    {/* Cover Image */}

                    <div
                      className="
                        w-full 
                        h-56 
                        bg-gray-100
                      "
                    >

                      {
                        cover ? (

<Image
    src={cover.url || `http://localhost:9000/listing-images/${cover.objectKey}`}
    alt={listing.title}
    width={600}
    height={400}
    unoptimized
    className="w-full h-full object-cover"
/>

                        ) : (

                          <div
                            className="
                              flex
                              items-center
                              justify-center
                              h-full
                              text-gray-400
                            "
                          >

                            No Image

                          </div>

                        )

                      }


                    </div>



                    {/* Content */}

                    <div className="p-4">


                      <h2
                        className="
                          text-xl
                          font-semibold
                          mb-2
                        "
                      >

                        {listing.title}

                      </h2>



                      <p
                        className="
                          text-gray-600
                          text-sm
                          mb-4
                        "
                      >
                        {listing.description}
                      </p>


                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-600">
                          ¥{listing.price}
                        </span>

                        <Link
                          href={`/listing/${listing.id}`}
                          className="
                            bg-blue-500
                            text-white
                            px-4
                            py-2
                            rounded-lg
                            hover:bg-blue-600
                            transition
                          "
                        >
                          View Details
                        </Link>
                      </div>

                    </div>

                  </div>

                );

              })

          }

        </div>

      </div>

    </>

  );

}
