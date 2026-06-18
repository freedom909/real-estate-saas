import { injectable } from "tsyringe";
import { IPaymentRepository } from "../../domain/repository/i-payment.repository";
import { Payment } from "../../domain/entity/payemnt.entity";
import PaymentModel from "../model/payment.model";

@injectable()
export class PaymentRepository implements IPaymentRepository {

  async findById( id: string  ): Promise<Payment | null> {

    const model =      await PaymentModel.findByPk(id);

    if (!model) {
      return null;
    }

    return this.toDomain(model);
  }

  async save(
    payment: Payment
  ): Promise<void> {

    const data =
      payment.toJSON();

    await PaymentModel.upsert({
      id: data.id,

      bookingId: data.bookingId,

      guestId: data.guestId,

      tenantId: data.tenantId,

      amount: data.amount,

      status: data.status,

      createdAt: data.createdAt,

      updatedAt: new Date(),

      processedAt: data.processedAt,

      completedAt: data.completedAt,

      refundedAt: data.refundedAt,

      cancelReason: data.cancelReason,
    });
  }

  async findByBookingId(
    bookingId: string
  ): Promise<Payment | null> {

    const model =
      await PaymentModel.findOne({
        where: { bookingId }
      });

    return model
      ? this.toDomain(model)
      : null;
  }

  async findByGuestId(
    guestId: string
  ): Promise<Payment[]> {

    const models =
      await PaymentModel.findAll({
        where: { guestId }
      });

    return models.map(
      m => this.toDomain(m)
    );
  }

  async delete(
    id: string
  ): Promise<void> {

    await PaymentModel.destroy({
      where: { id }
    });
  }

  private toDomain(
    model: any
  ): Payment {

    return Payment.rehydrate({

      id: model.id,

      bookingId: model.bookingId,

      guestId: model.guestId,

      tenantId: model.tenantId,

      dateRange: {
        checkInDate: model.checkInDate,
        checkOutDate: model.checkOutDate,
      },

      amount: model.amount,

      status: model.status,

      createdAt: model.createdAt,

      updatedAt: model.updatedAt,

      processedAt: model.processedAt,

      completedAt: model.completedAt,

      refundedAt: model.refundedAt,

      cancelReason: model.cancelReason,
    });
  }
}