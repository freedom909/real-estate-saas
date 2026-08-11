"use client";


import { useMutation, useQuery, ApolloProvider } from "@apollo/client/react";
import { GET_LISTING } from "@/app/graphql/listing/queries/listing";
import { CREATE_BOOKING } from "@/app/graphql/booking/mutations/createBooking";

import { use } from "react";
import { useState } from "react";

import { listingClient } from "@/app/lib/listingClient";

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



export default function ListingDetailPageWrapper(params: { params: Promise<{ id: string }> }) {
  return (
    <ApolloProvider client={listingClient}>
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



    const {
        data,
        loading,
        error

    } = useQuery<GetListingResponse>(
        GET_LISTING,
        {
            variables:{
                id
            }
        }
    );



    const [
        createBooking,
        {
            loading:bookingLoading
        }

    ] = useMutation(
        CREATE_BOOKING
    );




    if(loading){

        return <p>Loading...</p>;

    }


    if(error){

        return (

            <p>
                Error: {error.message}
            </p>

        );

    }



    const listing = data?.listing;



    if(!listing){

        return (

            <p>
                Listing not found
            </p>

        );

    }




    const cover =

        listing.pictures?.find(

            picture =>
                picture.sortOrder === 0

        )

        ??
        listing.pictures?.[0];




    const imageUrl = cover?.url ?? (cover?.objectKey
      ? (cover.objectKey.startsWith("http") ? cover.objectKey : `http://localhost:9000/listing-images/${cover.objectKey}`)
      : "/placeholder.jpg");
    const price = Number(listing.price ?? 0);



    const nights =

        checkInDate && checkOutDate

        ?

        Math.max(

            1,

            Math.ceil(

                (

                    new Date(checkOutDate).getTime()

                    -

                    new Date(checkInDate).getTime()

                )

                /

                (

                    1000 *

                    60 *

                    60 *

                    24

                )

            )

        )

        :

        1;



    const total = price * nights;





    const handleReserve = async()=>{


        if(!checkInDate || !checkOutDate){

            alert(
                "Please select dates"
            );

            return;

        }



        try{


            const result = await createBooking({

                variables:{

                    input:{

                        listingId:id,

                        checkInDate,

                        checkOutDate,

                    }

                }

            });



            console.log(

                "Booking created:",

                result.data

            );



            alert(
                "Booking successful!"
            );



            window.location.href =
                "/bookings";



        }catch(error){


            console.error(

                "Booking error:",

                error

            );


            alert(
                "Booking failed"
            );

        }


    };





return (

<>


<Navbar />



<div className="max-w-5xl mx-auto p-8">
<img
  src={imageUrl}
  alt={listing.title}

        className="
            w-full
            h-96
            object-cover
            rounded-xl
        "

    />




    <h1 className="
        text-4xl
        font-bold
        mt-8
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

        <br/>

        Guests:
        {listing.numOfCustomers}


    </div>





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

            onChange={e=>
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

            onChange={e=>
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

            {
                bookingLoading

                ?

                "Reserving..."

                :

                "Reserve"
            }


        </button>



    </div>



</div>


</>


);


}
