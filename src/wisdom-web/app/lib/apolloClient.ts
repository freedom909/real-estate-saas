// src/wisdom-web/app/lib/apolloClient.ts

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

import { setContext } from "@apollo/client/link/context";

import { useAuthStore } from "../store/auth.store";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000/graphql';
const httpLink = new HttpLink({uri: GATEWAY_URL, credentials: "include"}); 
const authLink = setContext((_, { headers }) => {

const token = useAuthStore.getState().accessToken;

console.log("Apollo token:", token);

return {

headers: {

...headers,

authorization: token ? `Bearer ${token}` : "",

},

};

});

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});



