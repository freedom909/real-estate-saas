// infrastructure/auth/authenticatedDataSource.ts
import {  GraphQLDataSourceProcessOptions,RemoteGraphQLDataSource } from "@apollo/gateway";
import { GraphQLRequest } from "@apollo/server";

interface Context {
  req?: {
    headers?: {
      [key: string]: string;
    };
  };
  authorization?: string;
}

export default class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  override willSendRequest(
    { request, context }: GraphQLDataSourceProcessOptions<Context>
  ) {
    if (!request.http) return;

    // ✅ Forward cookies
    // const cookie = context.req?.headers?.cookie;
    const authHeader=context.req?.headers?.authorization
if (authHeader) {
  request.http.headers.set("authorization", authHeader);
}
 
    // ✅ Forward Authorization header
    if (context.authorization) {
      request.http.headers.set(
        "authorization",
        context.authorization
      );
    }
  }
}

