import { gql } from "@apollo/client";


export const UPDATE_ADMIN_ACCOUNT = gql`
  mutation UpdateAdminAccount($id: ID!) {
    updateAdminAccount(id: $id) {
      id
      email
      password
      role
    }
  }
`;