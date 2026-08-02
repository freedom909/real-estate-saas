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
