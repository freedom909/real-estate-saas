// src/wisdom-web/app/ListingPage.tsx

"use client";

import Link from "next/link";
import Image from "next/image";

import { useQuery } from "@apollo/client/react";

import { GET_LISTINGS } from "../graphql/listing/queries/listings";

import Navbar from "../components/navbar";

import { Listing } from "../types/listing";


export default function ListingPage() {
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
    src={`http://localhost:9000/omaesama/${cover.objectKey}`}
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
                          line-clamp-3
                        "
                      >

                        {listing.description}

                      </p>



                      <div
                        className="
                          flex
                          justify-between
                          items-center
                        "
                      >


                        <span
                          className="
                            text-2xl
                            font-bold
                          "
                        >

                          ¥{listing.price}

                        </span>



                        <Link
                          href={`/listing/${listing.id}`}
                        >

                          <button
                            className="
                              bg-black
                              text-white
                              px-4
                              py-2
                              rounded-lg
                              hover:bg-gray-800
                            "
                          >

                            View

                          </button>


                        </Link>


                      </div>


                    </div>


                  </div>


                );

              }

            )
          }


        </div>


      </div>


    </>

  );

}