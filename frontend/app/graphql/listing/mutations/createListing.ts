// src/frontend/app/graphql/listing/mutations/createListing.ts


import { gql } from "@apollo/client";

export const CREATE_LISTING = gql`
  mutation CreateListing($input: CreateListingInput!) {
    createListing(input: $input) {
      id
      title
      description
      locationId
      pricePerNight
      pictures {
        id
        listingId
        objectKey
        url
        mimeType
        size
        type
        sortOrder
      }
      numOfBeds
      numOfBathrooms
      numOfRooms
      isFeatured
    }
  }
`;
