// FILE: src/subgraphs/booking/infrastructure/repositories/sequelize-booking.repository.ts

import { injectable } from "tsyringe";

import { BookingAttributes, BookingModel } from "../models/booking.model";
import { BookingPaginatedResult, BookingQuery, IBookingRepository } from "@/core/booking/domain/repositories/i-booking.repository";
import { Booking } from "@/core/booking/domain/entities/booking.entity";
import { DateRange } from "@/core/booking/domain/value-objects/date-range.vo";
import { BookingStatus } from "../../domain/value-objects/booking-status";
import { BookingLifecycleStatus } from "../../domain/value-objects/booking-lifecycle.status";
import { BookingMapper } from "../mappers/booking.mapper";
import { WhereOptions } from "sequelize/types/model";


const whereClause: WhereOptions<BookingAttributes> = {};

@injectable()
export class BookingRepository implements IBookingRepository {
  findByTenantId(tenantId: string): Promise<Booking[]> {
    throw new Error("Method not implemented.");
  }
  findLatestBookingByCustomerId(customerId: string): Promise<Booking | null> {
    throw new Error("Method not implemented.");
  }
  async findAll(query:BookingQuery): Promise<BookingPaginatedResult> {
    const result= await BookingModel.findAndCountAll({
    where: whereClause,
    limit: query.limit,
    offset: (query.page - 1) * query.limit,
    order: [[query.sortBy ?? "createdAt", query.sortOrder ?? "DESC"]],
    })
    if (!result){
      return  {
    items: [],
    total: 0,
    page: query.page,
    limit: query.limit,
    totalPages: 0,
} }
    return {
    items: result.rows.map(BookingMapper.toDomain),
    total: result.count,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(result.count / query.limit),
};
  }

  async findByListingOwnerId(ownerId: string): Promise<Booking[]> {
    if (!ownerId) return [];
    // Find all bookings, then filter by listing owner
    // In production, use a JOIN with listings table
    const models = await BookingModel.findAll({
      order: [["createdAt", "DESC"]],
    });
    return models.map((m) => this.toDomain(m));
  }

  async findByListingIds(listingIds: string[]): Promise<Booking[]> {
    if (!listingIds || listingIds.length === 0) return [];
    const models = await BookingModel.findAll({
      where: { listingId: listingIds } as any,
      order: [["createdAt", "DESC"]],
    });
    return models.map((m) => this.toDomain(m));
  }

  async findByLatestByCustomerId(customerId: string): Promise<Booking | null> {
    if (!customerId) return null;
    const model = await BookingModel.findOne({

      where: { customerId },
      order: [["createdAt", "DESC"]],
    });

    if (!model) return null;

    return this.toDomain(model);
  }

  async save(booking: Booking): Promise<void> {
    const data = booking.toJSON();

    await BookingModel.upsert({
      id: data.id,
      listingId: data.listingId,
      customerId: data.customerId,
      tenantId: data.tenantId,
      checkInDate: data.dateRange.checkInDate,
      checkOutDate: data.dateRange.checkOutDate,
      price: data.price,
      status: data.status,
      cancelReason: data.cancelReason,
      createdAt: data.createdAt,
      confirmedAt: data.confirmedAt,
      completedAt: data.completedAt,
      bookingLifecycleStatus: data.lifecycleStatus,
      updatedAt: new Date(),
    });
  }

  async findById(id: string): Promise<Booking | null> {
    const model = await BookingModel.findByPk(id);
    if (!model) return null;
    return this.toDomain(model);
  }


  async findByCustomerId(customerId: string): Promise<Booking[]> {
    const models = await BookingModel.findAll({
      where: { customerId },
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
      customerId: model.customerId,
      tenantId: model.tenantId,
      dateRange: new DateRange(
        new Date(model.checkInDate),
        new Date(model.checkOutDate)
      ),
      reservationNumber: model.reservationNumber,
      price: model.price,
      status: model.status as BookingStatus, // Explicitly cast to BookingStatus
      cancelReason: model.cancelReason,
      createdAt: model.createdAt,
      confirmedAt: model.confirmedAt,
      updatedAt: model.updatedAt,
      completedAt: model.completedAt,
      lifecycleStatus: model.bookingLifecycleStatus as BookingLifecycleStatus,
    });
  }

}
