import { gql } from "@apollo/client";

export const GET_FEATURED_LISTINGS = gql`
  query GetFeaturedListings($limit: Int) {
    featuredListings(limit: $limit) {
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
      numOfCustomers
      isFeatured
    }
  }
`;
