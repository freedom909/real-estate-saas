// src/frontend/app/graphql/listing/mutations/listing-status.ts

import { gql } from "@apollo/client";

export const PUBLISH_LISTING = gql`
  mutation PublishListing($id: ID!) {
    publishListing(id: $id) {
      id
      status
      isBookable
    }
  }
`;

export const UNPUBLISH_LISTING = gql`
  mutation UnpublishListing($id: ID!) {
    unpublishListing(id: $id) {
      id
      status
      isBookable
    }
  }
`;

export const SUSPEND_LISTING = gql`
  mutation SuspendListing($id: ID!) {
    suspendListing(id: $id) {
      id
      status
      isBookable
    }
  }
`;