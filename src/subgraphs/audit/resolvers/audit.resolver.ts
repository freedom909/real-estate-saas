import { container } from 'tsyringe';
import { AuditService } from '../services/audit.service';
import mongoose from 'mongoose';
import { UserInputError } from '@/infrastructure/utils/errors';

export const resolvers = {
  Query: {
    getAuditLog: async (_: any, { userId }: { userId: string }) => {
      const service = container.resolve(AuditService);
      return service.getAuditLog(userId);
    },
    getAuditLogsByResource: async (_: any, { resourceId }: { resourceId: string }) => {
      const service = container.resolve(AuditService);
      return service.getLogsByResource(resourceId);
    },
  },
  Mutation: {
    recordAuditLog: async (_, args) => {
      if (!args.userId || !mongoose.Types.ObjectId.isValid(args.userId)) {
        throw new UserInputError('Invalid or missing userId for audit log');
      }
      if (args.resourceId && !mongoose.Types.ObjectId.isValid(args.resourceId)) {
        throw new UserInputError('Invalid resourceId for audit log');
      }

      const service = container.resolve(AuditService);
      return service.createLog(args.action, args.userId, args.resourceId, args.metadata);
    },
  },
  AuditLog: {
    user: (parent) => ({ __typename: 'User', id: parent.userId })
  }
};
