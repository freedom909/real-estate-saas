import { container } from 'tsyringe';
import { AuditService } from '../services/audit.service';
import AuditModel from '../models/audit.model';
import mongoose from 'mongoose';
import { UserInputError } from '@/infrastructure/utils/errors';

export const resolvers = {
  Query: {
    getAuditLog: async (_: any, { id }: { id: string }) => {
      const service = container.resolve(AuditService);
      return service.getAuditLog(id);
    },
    getAuditLogsByResource: async (_: any, { resourceId }: { resourceId: string }) => {
      const service = container.resolve(AuditService);
      return service.getLogsByResource(resourceId);
    },
  },
  Mutation: {
    recordAuditLog: async (_, args) => {
      // Validate userId and resourceId to ensure they are valid ObjectId strings
      if (!args.userId || !mongoose.Types.ObjectId.isValid(args.userId)) {
        throw new UserInputError('Invalid or missing userId for audit log');
      }
      if (!args.resourceId || !mongoose.Types.ObjectId.isValid(args.resourceId)) {
        throw new UserInputError('Invalid or missing resourceId for audit log');
      }

      return AuditModel.create({
        action: args.action,
        userId: args.userId,
        resourceId: args.resourceId,
        metadata: args.metadata,
        timestamp: new Date(),
      });
    },
  },
  AuditLog: {
    //User federation mapping could be added here if we had a User type in the schema
    user: (parent) => ({ __typename: 'User', id: parent.userId })
  }
};