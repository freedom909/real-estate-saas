//src/modules/container/audit-client.register.ts

import { DependencyContainer } from "tsyringe";
import { GraphQLClient } from "graphql-request";

import AuditClient from "@/packages/audit-sdk/src/client/audit.client";
import { TOKENS_AUDIT } from "../tokens/audit.tokens";

export function registerAuditClientDependencies(
  container: DependencyContainer
) {
  const auditUrl =
    process.env.AUDIT_SUBGRAPH_URL ||
    "http://localhost:4080/graphql";

  container.register(TOKENS_AUDIT.auditClient, {
    useValue: new AuditClient(auditUrl),
  });

  container.register(TOKENS_AUDIT.graphqlClient, {
    useValue: new GraphQLClient(auditUrl),
  });
}