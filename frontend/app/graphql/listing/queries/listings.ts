// src/wisdom-web/app/graphql/queries/listings.ts

import { gql } from "@apollo/client";

export const GET_LISTINGS = gql`

query GetListings {

listings {

id

title

description

address

price
pictures {
        id
        listingId
        objectKey
        
        mimeType
        size
        type
        sortOrder
      }
numOfBeds

numOfCustomers

isFeatured

}

}

`;