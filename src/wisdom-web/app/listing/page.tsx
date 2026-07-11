// src/wisdom-web/app/ListingPage.ts

"use client";

import Link from "next/link";

import { useQuery } from "@apollo/client/react";

import { GET_LISTINGS } from "../graphql/listing/queries/listings";

import Navbar from "../components/navbar";

export default function ListingPage() {

const { data, loading, error } = useQuery<any>(GET_LISTINGS, {

variables: {

limit: 10,

offset: 0,

},

});
console.log("DETAIL DATA =", data);
if (loading) return <p>Loading...</p>;

if (error) return <p>Error: {error.message}</p>;

return (

<>

<Navbar />

<div className="p-8">

<h1 className="text-3xl font-bold mb-6">Listings</h1>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

{data?.listings?.map((listing: any) => (

<div key={listing.id} className="border rounded-xl overflow-hidden shadow">

<div className="p-4">

<h2 className="text-xl font-semibold mb-2">

{listing.title}

</h2>

<p className="text-gray-600 text-sm mb-3">

{listing.description}

</p>

<div className="flex justify-between items-center">

<span className="text-2xl font-bold">

¥{listing.price}

</span>

<Link href={`/listing/${listing.id}`}>

<button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">

View

</button>

</Link>

</div>

</div>

</div>

))}

</div>

</div>

</>

);

}