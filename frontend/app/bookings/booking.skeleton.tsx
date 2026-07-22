// 预订骨架屏
"use client";

import { useQuery } from "@apollo/client/react";

import { MY_BOOKINGS } from "@/app/graphql/booking/queries/myBookings";


export function BookingSkeleton() {
const { data, loading, error } = useQuery(MY_BOOKINGS);
if(loading){
  return (
    <div className="overflow-hidden rounded-2xl border bg-white hover:shadow-lg transition">
      <div className="flex flex-col md:flex-row">
        <div className="w-full h-56 bg-gray-100 rounded-t-2xl" />
        loading...
        </div>
      
      </div>   
   
  );
}}