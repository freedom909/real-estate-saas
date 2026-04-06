// FILE: src/subgraphs/order/application/use-cases/confirm-order.use-case.ts

import { injectable, inject } from 'tsyringe';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { OrderProps } from '../../domain/entities/order.entity';

@injectable()
export class ConfirmOrderUseCase {
  constructor(
    @inject('OrderRepository') private orderRepo: IOrderRepository
  ) {}

  async execute(orderId: string): Promise<OrderProps> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new Error('Order not found');

    order.confirm(); // Logic inside entity
    await this.orderRepo.update(order);
    
    return order.toJSON();
  }
}