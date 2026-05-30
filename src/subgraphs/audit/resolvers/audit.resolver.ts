import GetAuditLogsByResourceQuery from "@/modules/audit/application/read/queries/get-audit-logs-by-resource.query";
import {
  GetAuditLogsQuery,
  type GetAuditLogsFilter
} from "@/modules/audit/application/read/queries/get-audit-logs.query";
import {
  GetDecisionLogsQuery,
  type GetDecisionLogsFilter
} from "@/modules/audit/application/read/queries/get-decision-logs.query";
import {
  GetSystemLogsQuery,
  type GetSystemLogsFilter
} from "@/modules/audit/application/read/queries/get-system-logs.query";
import {
  TOKENS_AUDIT
} from "@/modules/tokens/ai/audit.tokens";

import {
  container
} from "tsyringe";

export const resolvers = {
  Query: {
    auditLogs: async (
      _: unknown,
      filter: GetAuditLogsFilter,
      context: any
    ) => {

      if (!context.user) {
        throw new Error(
          "Unauthorized"
        );
      }

      const query =
        container.resolve(
          TOKENS_AUDIT.queries
            .getAuditLogs
        ) as GetAuditLogsQuery;

      return await query.execute(
        filter
      );
    },

    auditLogsByResource:
      async (
        _: unknown,
        {
          resourceId,
        }: {
          resourceId: string;
        }
      ) => {

        const query =
          container.resolve(
            TOKENS_AUDIT.queries
              .getAuditLogsByResource
          ) as GetAuditLogsByResourceQuery;

        return await query.execute(
          resourceId
        );
      },

    decisionLogs: async (
      _: unknown,
      {
        filter
      }: {
        filter: GetDecisionLogsFilter
      },
      context: any
    ) => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      const query = container.resolve(
        TOKENS_AUDIT.queries.getDecisionLogs
      ) as GetDecisionLogsQuery;

      return await query.execute(filter);
    },

    systemLogs: async (
      _: unknown,
      {
        filter
      }: {
        filter: GetDecisionLogsFilter
      },
      context: any
    ) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required");
      }

      const query = container.resolve(
        TOKENS_AUDIT.queries.getSystemLogs
      ) as GetSystemLogsQuery;

      return await query.execute(filter);
    },
  },

  AuditLog: {
    user: (
      parent: any
    ) => ({
      __typename: "User",
      id:
        parent.userId,
    }),
  },
};