// src/wisdom-web/app/graphql/queries/listing.ts

import { gql } from "@apollo/client";

export const GET_LISTING = gql`
query GetListing($id: ID!) {
  listing(id: $id) {
    id
    title
    description
    address
    price
    pricePerNight
    picture
    numOfBeds
    numOfBathrooms
    numOfRooms
    numOfCustomers
    locationId
    isFeatured
    ownerId
    categories {
      id
      name
    }
  }
}`;
