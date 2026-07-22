import { gql } from "@apollo/client";

import { client } from "../lib/apolloClient";

const GET_USER = gql`

query GetUser($id: ID!) {

user(id: $id) {

id

email

name

}

}

`;

export async function getUser(id: string) {

const { data } = await client.query({

query: GET_USER,

variables: { id },

});

return data?.user;

}