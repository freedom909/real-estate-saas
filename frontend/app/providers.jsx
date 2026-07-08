"use client";
// src/wisdom-web/app/providers.jsx
import { ApolloProvider } from "@apollo/client/react";
import { client } from "../lib/apolloClient";

export default function Providers({ children }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}