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
    createBillingAccount: async (_: any, { hostId }: { hostId: string }) => {
      const service = container.resolve(BillingService);
      return service.createAccount(hostId);
    },
    addCredit: async (_: any, { accountId, amount }: { accountId: string; amount: number }) => {
      const service = container.resolve(BillingService);
      return service.addCredit(accountId, amount);
    },
  },
  BillingAccount: {
    host: (parent: any) => {
      return { __typename: 'Host', id: parent.hostId };
    },
    __resolveReference: async (ref: { id: string }) => {
      const service = container.resolve(BillingService);
      return service.getBillingAccount(ref.id);
    },
  },
  Host: {
    billingAccount: async (parent: { id: string }) => {
      const service = container.resolve(BillingService);
      return service.getAccountByHost(parent.id);
    }
  }
};