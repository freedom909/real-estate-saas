import { gql } from "@apollo/client";

export const CREATE_LISTING = gql`
  mutation CreateListing($input: CreateListingInput!) {
    createListing(input: $input) {
      id
      title
      description
      address
      price
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
