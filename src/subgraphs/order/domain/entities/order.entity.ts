// FILE: src/subgraphs/order/domain/entities/order.entity.ts

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'EXPIRED';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export interface OrderProps {
  id: string;
  orderNumber: string;
  guestId: string;
  listingId: string;
  checkInDate: Date;
  checkOutDate: Date;
  totalPrice: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class Order {
  private constructor(private props: OrderProps) {}

  // ✅ 用于新建订单
  static create(props: OrderProps): Order {
    return new Order({
      ...props,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // ✅ 🔥 用于数据库恢复（重点）
  static rebuild(props: OrderProps): Order {
    return new Order(props);
  }

  toJSON() {
    return this.props;
  }

  get id() {
    return this.props.id;
  }
}