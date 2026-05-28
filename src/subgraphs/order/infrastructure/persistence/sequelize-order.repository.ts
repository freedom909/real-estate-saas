// FILE: src/subgraphs/order/infrastructure/persistence/sequelize-order.repository.ts

import { injectable } from 'tsyringe';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order } from '../../domain/entities/order.entity';
import OrderModel from './models/order.model';

@injectable()
export class SequelizeOrderRepository implements IOrderRepository {
  async findById(id: string): Promise<Order | null> {
    const model = await OrderModel.findByPk(id);
    if (!model) return null;
    return this.mapToEntity(model);
  }

  async findAll(filter: any = {}): Promise<Order[]> {
    const models = await OrderModel.findAll({ where: filter });
    return models.map((m) => this.mapToEntity(m));
  }

  async save(order: Order): Promise<void> {
    const data = order.toJSON();
    await OrderModel.create(data as any);
  }

  async update(order: Order): Promise<void> {
    const data = order.toJSON();
    await OrderModel.update(data, { where: { id: data.id } });
  }

  private mapToEntity(model: OrderModel): Order {
    return Order.rebuild({//クラス 'Order' のコンストラクターはプライベートであり、クラス宣言内でのみアクセス可能です。
      id: model.id,
      orderNumber: model.orderNumber,
      guestId: model.guestId,
      listingId: model.listingId,
      checkInDate: new Date(model.checkInDate),
      checkOutDate: new Date(model.checkOutDate),
      totalPrice: model.totalPrice,
      status: model.status as any,
      paymentStatus: model.paymentStatus as any,
      paymentIntentId: model.paymentIntentId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      
    });
  }
}
