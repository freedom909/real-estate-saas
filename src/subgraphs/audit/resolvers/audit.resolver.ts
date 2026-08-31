import { container } from 'tsyringe';

import mongoose from 'mongoose';
import { UserInputError } from '@/infrastructure/utils/errors';
import { TOKENS_AUDIT } from '@/modules/tokens/audit.tokens';
import { GetAuditLogsFilter, GetAuditLogsQuery } from '@/core/audit/application/read/queries/get-audit-logs.query';
import { AuditLogger } from '@/core/audit/application/write/services/audit.logger';


export const resolvers = {
  Query: {
    getAuditLogs: async (_: any, {filter}: {filter: GetAuditLogsFilter}, context:any) => {
      const service = container.resolve<GetAuditLogsQuery>(TOKENS_AUDIT.services.getAuditLogsQuery);
      return service.execute(filter??{});
    },

  },
  Mutation: {
    recordAuditLogs: async (_, args) => {
      if (!args.userId ) {
        throw new UserInputError('Invalid or missing userId for audit log');
      }
      if (args.resourceId && !mongoose.Types.ObjectId.isValid(args.resourceId)) {
        throw new UserInputError('Invalid resourceId for audit log');
      }

      const service = container.resolve<AuditLogger>(TOKENS_AUDIT.services.auditLogger);
      return service.writeAuditLog({...args.input})
    },
  },
  AuditLog: {
    user: (parent) => ({ __typename: 'User', id: parent.userId })
  }
};
