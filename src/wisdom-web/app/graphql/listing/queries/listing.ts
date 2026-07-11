// src/wisdom-web/app/graphql/listing/queries/listing.ts

import { gql } from "@apollo/client";

export const GET_LISTING = gql`

query GetListing($id: ID!) {

listing(id: $id) {

id

title

description

address

price

picture

numOfBeds

numOfCustomers

isFeatured

}
}`