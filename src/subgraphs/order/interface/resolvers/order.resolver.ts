// FILE: src/subgraphs/order/interface/resolvers/order.resolver.ts

import { container } from 'tsyringe';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { ConfirmOrderUseCase } from '../../application/use-cases/confirm-order.use-case';

export const resolvers = {
  Query: {
    order: async (_: any, { id }: { id: string }) => {
      // In a full implementation, you'd have a GetOrderUseCase
      const repo = container.resolve('OrderRepository') as any;
      const order = await repo.findById(id);
      return order ? order.toJSON() : null;
    },
  },
  Mutation: {
    createOrder: async (_: any, { input }: any) => {
      const useCase = container.resolve(CreateOrderUseCase);
      return useCase.execute(input);
    },
    confirmOrder: async (_: any, { id }: { id: string }) => {
      const useCase = container.resolve(ConfirmOrderUseCase);
      return useCase.execute(id);
    },
  },
  Order: {
    __resolveReference: async (reference: any) => {
      const repo = container.resolve('OrderRepository') as any;
      const order = await repo.findById(reference.id);
      return order ? order.toJSON() : null;
    }
  }
};