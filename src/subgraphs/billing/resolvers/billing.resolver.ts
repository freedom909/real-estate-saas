import { container } from 'tsyringe';
import { BillingService } from '../services/billing.service';

export const resolvers = {
  Query: {
    getBillingAccount: async (_: any, { id }: { id: string }) => {
      const service = container.resolve(BillingService);
      return service.getBillingAccount(id);
    },
  },
  Mutation: {
    createBillingAccount: async (_: any, { tenantId }: { tenantId: string }) => {
      const service = container.resolve(BillingService);
      return service.createAccount(tenantId);
    },
    addCredit: async (_: any, { accountId, amount }: { accountId: string; amount: number }) => {
      const service = container.resolve(BillingService);
      return service.addCredit(accountId, amount);
    },
  },
  BillingAccount: {
    tenant: (parent: any) => {
      return { __typename: 'Tenant', id: parent.tenantId };
    },
    __resolveReference: async (ref: { id: string }) => {
      const service = container.resolve(BillingService);
      return service.getBillingAccount(ref.id);
    },
  },
  Tenant: {
    billingAccount: async (parent: { id: string }) => {
      const service = container.resolve(BillingService);
      return service.getAccountByTenant(parent.id);
    }
  }
};