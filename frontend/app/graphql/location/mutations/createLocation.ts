import { gql } from "@apollo/client";

export const CREATE_LOCATION = gql`
  mutation CreateLocation($input: CreateLocationInput!) {
    createLocation(input: $input) {
      code
      success
      message
      location {
        id
        name
        country
        postalCode
        prefecture
        city
        town
        address
      }
    }
  }
`;
