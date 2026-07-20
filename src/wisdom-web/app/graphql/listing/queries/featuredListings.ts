import { gql } from "@apollo/client";

export const GET_FEATURED_LISTINGS = gql`
  query GetFeaturedListings($limit: Int) {
    featuredListings(limit: $limit) {
      id
      title
      description
      address
      price
      picture
      numOfBeds
      numOfCustomers
      isFeatured
    }
  }
`;
