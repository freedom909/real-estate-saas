// src/frontend/app/graphql/listing/mutations/listing.ts


import { gql } from "@apollo/client";

export const PUBLISH_LISTING = gql`
  mutation PublishListing($id: ID!) {
    publishListing(id: $id) {
      id
      status
    }
  }
`;

export const UNPUBLISH_LISTING = gql`
  mutation UnpublishListing($id: ID!) {
    unpublishListing(id: $id) {
      id
      status
    }
  }
`;
