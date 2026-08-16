import { gql } from "@apollo/client";

export const BECOME_HOST = gql`
  mutation BecomeHost {
    becomeHost {
      id
      name
      picture
      role
      profile {
        email
      }
    }
  }
`;