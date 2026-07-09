import { Payment } from "../../domain/entity/payemnt.entity";

export class PaymentMapper {

  static toDomain(
    row: any
  ): Payment {

    return Payment.rehydrate({

      id: row.id,

      bookingId: row.bookingId,

      customerId: row.customerId,

      tenantId: row.tenantId,

      dateRange: {
        checkInDate: row.checkInDate,
        checkOutDate: row.checkOutDate,
      },

      amount: Number(
        row.amount
      ),

      status: row.status,

      createdAt: row.createdAt,

      updatedAt: row.updatedAt,

      processedAt: row.processedAt,

      completedAt: row.completedAt,

      refundedAt: row.refundedAt,

      cancelReason:
        row.cancel_reason,
    });
  }

  static toPersistence(
    payment: Payment
  ) {

    const data = payment.toJSON();
    return {
      id: data.id,
      bookingId: data.bookingId,
      customerId: data.customerId,
      tenantId: data.tenantId,
      checkInDate: data.dateRange.checkInDate,
      checkOutDate: data.dateRange.checkOutDate,
      amount: data.amount,
      status: data.status,
      createdAt: data.createdAt,
      processedAt: data.processedAt,
      completedAt: data.completedAt,
      refundedAt: data.refundedAt,
      cancelReason: data.cancelReason,
    };
  }
}