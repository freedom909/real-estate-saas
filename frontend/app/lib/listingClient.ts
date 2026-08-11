import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

// Direct connection to listing subgraph (bypasses gateway)
const listingHttpLink = new HttpLink({
  uri: "http://localhost:4101/graphql",
});

export const listingClient = new ApolloClient({
  link: listingHttpLink,
  cache: new InMemoryCache(),
});
