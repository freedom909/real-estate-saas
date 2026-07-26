import { gql } from "@apollo/client";

export const UPDATE_LISTING = gql`
  mutation UpdateListing($id: ID!, $input: UpdateListingInput!) {
    updateListing(id: $id, input: $input) {
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
      categories {
        id
        name
      }
    }
  }
`;
