import { container } from 'tsyringe';
import { AuditService } from '../services/audit.service';

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
    createAuditLog: async (_: any, { action, userId, resourceId }: { action: string; userId: string; resourceId: string }) => {
      const service = container.resolve(AuditService);
      return service.createLog(action, userId, resourceId);
    },
  },
  AuditLog: {
    // User federation mapping could be added here if we had a User type in the schema
    // user: (parent) => ({ __typename: 'User', id: parent.userId })
  }
};