//src/app/graphql/user/query/current.user.ts

import { gql } from "@apollo/client";

export const CURRENT_USER = gql`
  query CurrentUser {
    currentUser {
      id
      email
      name
      role
    }
  }
`;
