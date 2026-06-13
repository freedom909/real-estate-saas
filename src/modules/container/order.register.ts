// FILE: src/subgraphs/order/container/index.ts

import { SequelizeOrderRepository } from '@/core/order/infrastructure/persistence/sequelize-order.repository';
import { container } from 'tsyringe';
;

container.register('OrderRepository', {
  useClass: SequelizeOrderRepository
});