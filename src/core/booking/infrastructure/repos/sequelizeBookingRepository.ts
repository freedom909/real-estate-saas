// FILE: src/subgraphs/booking/infrastructure/repositories/sequelize-booking.repository.ts

import { injectable } from "tsyringe";
import { IBookingRepository } from "../../domain/repositories/i-booking.repository";
import { Booking } from "../../domain/entities/booking.entity";
import { BookingModel } from "../models/booking.model";
import { DateRange } from "../../domain/value-objects/date-range.vo";
import { BookingLifecycleStatus } from "../../domain/value-objects/booking-lifecycle.status";
import { BookingStatus } from "../../domain/value-objects/booking-status";

@injectable()
export class SequelizeBookingRepository implements IBookingRepository {

  async findById(id: string): Promise<Booking | null> {
    const model = await BookingModel.findByPk(id);

    if (!model) return null;

    return this.toDomain(model);
  }

  async save(booking: Booking): Promise<void> {
    const data = booking.toJSON();

    await BookingModel.upsert({
      id: data.id,
      listingId: data.listingId,
      guestId: data.guestId,
      tenantId: data.tenantId,
      checkInDate: data.dateRange.checkInDate,
      checkOutDate: data.dateRange.checkOutDate,
      price: data.price,  
      status: data.status,
      cancelReason: data.cancelReason,
      createdAt: data.createdAt,
      updatedAt: new Date(),
      confirmedAt: data.confirmedAt,
    });
  }

  async findByGuestId(guestId: string): Promise<Booking[]> {
    const models = await BookingModel.findAll({
      where: { guestId },
      order: [["createdAt", "DESC"]],
    });

    return models.map((m) => this.toDomain(m));
  }

  async delete(id: string): Promise<void> {
    await BookingModel.destroy({
      where: { id },
    });
  }

  // =========================
  // 🔥 Mapper（关键！）
  // =========================

  private toDomain(model: any): Booking {
    return Booking.rehydrate({
      id: model.id,
      listingId: model.listingId,
      guestId: model.guestId,
      dateRange: new DateRange(
        new Date(model.checkInDate),
        new Date(model.checkOutDate)
      ),
      tenantId: model.tenantId,
      price: model.price,
      status: model.status as BookingStatus, // Explicitly cast to BookingStatus
      cancelReason: model.cancelReason,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      lifecycleStatus: model.bookingLifecycleStatus as BookingLifecycleStatus,
      confirmedAt: model.confirmedAt,
    });
  }
}