import { gql } from "@apollo/client";

export const GET_LOCATION = gql`
query Location {
  location {
    id
    name
  }
}
`;

export const ALL_LOCATIONS = gql`
query Locations {
  locations {
    id
    name
    city
    province
    country
  }
}
`;

export const GET_LOCATION_BY_ID = gql`
query LocationById($locationId: ID) {
  locations(locationId: $locationId) {
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
`;
