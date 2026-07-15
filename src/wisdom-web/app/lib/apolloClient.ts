// src/wisdom-web/app/lib/apolloClient.ts

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

import { SetContextLink } from "@apollo/client/link/context";

import { useAuthStore } from "../store/auth.store"
const httpLink = new HttpLink({

uri: "http://localhost:4000/graphql"
,

});

const authLink = new SetContextLink((operation) => {

const token = useAuthStore.getState().accessToken;
console.log("Apollo token =>", token);
return {

headers: {

authorization: token ? `Bearer ${token}` : "",

},

};

});


export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});



