// src/infrastructure/utils/baseGateway.ts

import { GraphQLClient } from "graphql-request";

export abstract class BaseGateway {
  protected createClient(url: string) {
    const token = process.env.INTERNAL_SERVICE_TOKEN;

    if (!token) {
      throw new Error(
        "INTERNAL_SERVICE_TOKEN is not configured for internal gateway requests",
      );
    }

    return new GraphQLClient(url, {
      headers: {
        "x-service-token": token,
      },
    });
  }
}
