// src/wisdom-web/app/lib/apolloClient.ts

import { ApolloClient,  HttpLink,  InMemoryCache } from "@apollo/client/core";
import {  SetContextLink } from "@apollo/client/link/context";
import { useAuthStore } from "../store/auth.store";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000/graphql';
const httpLink = new HttpLink({uri: GATEWAY_URL, credentials: "include"}); 
const authLink = new SetContextLink((prevContext) => {
    const token = useAuthStore.getState().accessToken;

    return {
        headers: {
            ...prevContext.headers,
            authorization: token
                ? `Bearer ${token}`
                : "",
        },
    };
});

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});



