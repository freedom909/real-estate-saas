// src/wisdom-web/app/auth/auth.provider.tsx

"use client";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "../lib/apolloClient";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}