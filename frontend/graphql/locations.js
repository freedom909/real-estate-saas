import { gql } from "@apollo/client";

export const LIST_LOCATIONS = gql`
  query ListLocations {
    locations {
      id
      name
      city
      state
      country
      zip
      latitude
      longitude
      radius
      units
    }
  }
`;
