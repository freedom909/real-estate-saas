// FILE: src/subgraphs/order/application/usecases/create-order.usecase.ts

import { injectable, inject } from 'tsyringe';
import { Order, OrderProps } from '../../domain/entities/order.entity';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { v4 as uuidv4 } from 'uuid';


@injectable()
export class CreateOrderUseCase {
  constructor(
    @inject('OrderRepository') private orderRepo: IOrderRepository
  ) {}

  async execute(data: any): Promise<OrderProps> {
    const order = Order.create({
      guestId: data.guestId,
      listingId: data.listingId,
      checkInDate: new Date(data.checkInDate),
      checkOutDate: new Date(data.checkOutDate),
      price: data.price,
      orderNumber: data.orderNumber,
      paymentIntentId: data.paymentIntentId,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      id: uuidv4(),
    });

    await this.orderRepo.save(order);
    return order.toJSON();
  }
}


