//frontend/app/graphql/tenant/queries/tenant.ts

import { gql } from "@apollo/client";

export const GET_TENANTS = gql`
  query GetTenants($filter: TenantFilterInput) {
    getTenants(filter: $filter) {
      items {
        id
        name
        slug
        status
      }
      pageInfo {
        total
        hasNextPage
      }
    }
  }
`;