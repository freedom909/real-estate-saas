//src/subgraphs/audit/resolvers/audit.resolver.ts


import { container } from "tsyringe";

import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import {
  GetAuditLogsFilter,
  GetAuditLogsQuery,
} from "@/core/audit/application/read/queries/get-audit-logs.query";
import { AuditLogger } from "@/core/audit/application/write/services/audit.logger";
import { CreateAuditLogDTO } from "@/core/audit/application/write/dto/create-audit-log.dto";

export const resolvers = {
  Query: {
    getAuditLogs: async (
      _: unknown,
      { filter }: { filter?: GetAuditLogsFilter },
    ) => {
      const service = container.resolve<GetAuditLogsQuery>(
        TOKENS_AUDIT.services.getAuditLogsQuery,
      );

      return service.execute(filter ?? {});
    },
  },

  Mutation: {
    recordAuditLog: async (
      _: unknown,
      { input }: { input: CreateAuditLogDTO },
    ) => {
      const service = container.resolve<AuditLogger>(
        TOKENS_AUDIT.services.auditLogger,
      );

      return service.writeAuditLog(input);
    },
  },

  AuditLog: {
    user: (parent: { userId?: string | null }) =>
      parent.userId
        ? { __typename: "User", id: parent.userId }
        : null,
  },
};
