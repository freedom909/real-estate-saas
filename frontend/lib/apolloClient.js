import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client/core";

const client = new ApolloClient({ // this is the client for the frontend
  link: new HttpLink({
    uri: "http://localhost:4000/graphql",
    credentials: "include",
  }),
  cache: new InMemoryCache(),
});

export { client };
export { client as api };
export default client;