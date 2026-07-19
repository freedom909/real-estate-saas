import { gql } from "@apollo/client";

export const CHAT = gql`
  mutation Chat($message: String!) {
    chat(input: { message: $message }) {
      success
      summary
      artifacts {
        type
        content
      }
    }
  }
`;
