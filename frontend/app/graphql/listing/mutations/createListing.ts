import { gql } from "@apollo/client";

export const CREATE_LISTING = gql`
  mutation CreateListing($input: CreateListingInput!) {
    createListing(input: $input) {
      id
      title
      description
      address
      price
      picture
      numOfBeds
      numOfBathrooms
      numOfRooms
      isFeatured
    }
  }
`;
