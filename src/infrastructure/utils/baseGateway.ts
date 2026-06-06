// src/infrastructure/utils/baseGateway.ts

import { GraphQLClient } from "graphql-request";

export abstract class BaseGateway {
  protected createClient(url: string) {
    return new GraphQLClient(url, {
      headers: {
        Authorization:
          `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
      },
    });
  }
}