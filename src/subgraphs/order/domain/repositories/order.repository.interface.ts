// FILE: src/subgraphs/order/domain/repositories/order.repository.interface.ts

import { Order } from '../entities/order.entity';

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findAll(filter?: any): Promise<Order[]>;
  save(order: Order): Promise<void>;
  update(order: Order): Promise<void>;
}
