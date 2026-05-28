// FILE: src/subgraphs/order/container/index.ts

import { container } from 'tsyringe';
import { SequelizeOrderRepository } from '../../subgraphs/order/infrastructure/persistence/sequelize-order.repository';

container.register('OrderRepository', {
  useClass: SequelizeOrderRepository
});