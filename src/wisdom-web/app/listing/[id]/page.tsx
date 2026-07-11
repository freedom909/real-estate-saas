"use client";

import { useQuery } from "@apollo/client/react";
import { GET_LISTING } from "app/graphql/listing/queries/listing";
import { use } from "react";



import { gql } from "@apollo/client";
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

const { id } = use(params);

const { data, loading, error } = useQuery(GET_LISTING, {

variables: { id },

});

if (loading) return <p>Loading...</p>;

if (error) return <p>Error: {error.message}</p>;

const listing = (data as any)?.listing;

return (

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

</div>

);

}
