import { gql } from "graphql-request";

/* =========================
   Queries
========================= */

export const FIND_BY_ID = gql`
  query user($id: ID!) {
    user(id: $id) {
      id      
      profile {
        name
        avatar
        email
      }
    }
  }
`;

export const INTERNAL_FIND_USER_BY_EMAIL = gql`
query InternalUserByEmail($email: String!) {
  internalUserByEmail(email: $email) {
    id
    profile {
      avatar
      email
      name
    }
  }
}
`;


export const FIND_USER_BY_EMAIL = gql`
query Query($email: String!) {
  userByEmail(email: $email) {
    id
    profile {
      avatar
      email
      name
    }
  }
}
`;

/* =========================
   Mutations
========================= */

export const CREATE_OAUTH_USER = gql`
  mutation CreateOAuthUser($input: CreateOAuthUserInput!) {
    createOAuthUser(input: $input) { 
      id      
    }
  }
`;