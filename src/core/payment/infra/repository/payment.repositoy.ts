import { injectable } from "tsyringe";
import { IPaymentRepository } from "../../domain/repository/i-payment.repository";
import { Payment } from "../../domain/entity/payemnt.entity";
import PaymentModel from "../model/payment.model";
import { PaymentMapper } from "./payment.mapper";

@injectable()
export class PaymentRepository implements IPaymentRepository {

  async findById(id: string): Promise<Payment | null> {
    const model = await PaymentModel.findByPk(id);

    if (!model) {
      return null;
    }

    return PaymentMapper.toDomain(model);
  }

  async save(
    payment: Payment
  ): Promise<void> {

    const data = PaymentMapper.toPersistence(payment);

    await PaymentModel.upsert({
      ...data,
      updatedAt: new Date(),
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
      ? PaymentMapper.toDomain(model)
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
      m => PaymentMapper.toDomain(m)
    );
  }

  async delete(
    id: string
  ): Promise<void> {

    await PaymentModel.destroy({
      where: { id }
    });
  }
}