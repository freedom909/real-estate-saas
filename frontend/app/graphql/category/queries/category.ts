import { gql } from "@apollo/client";

export const GET_CATEGORIES = gql`
query Categories {
  category {
    id
    name
  }
}
`;

export const ALL_CATEGORIES = gql`
query Categories {
  categories {
    id
    name
  }
}
`;
