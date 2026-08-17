// src/core/calendar/infrastructure/persistence/calendar.repository.ts

import { injectable } from "tsyringe";
import { Op } from "sequelize";
import { ICalendarRepository } from "../../domain/repositories/i-calendar.repository";
import { CalendarSlot } from "../../domain/entities/calendar-slot";
import { CalendarSlotModel } from "../models/calendar-slot.model";
import { SlotStatus } from "../../domain/value-objects/slot-status";

@injectable()
export class CalendarRepository implements ICalendarRepository {

  async findSlots(
    listingId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<CalendarSlot[]> {
    const models = await CalendarSlotModel.findAll({
      where: {
        listingId,
        date: {
          [Op.gte]: checkIn,
          [Op.lt]: checkOut,  // exclusive — same as DateRange semantics
        },
      },
      order: [["date", "ASC"]],
    });
    return models.map((m) => this.toDomain(m));
  }

  async findAllByListing(listingId: string): Promise<CalendarSlot[]> {
    const models = await CalendarSlotModel.findAll({
      where: { listingId },
      order: [["date", "ASC"]],
    });
    return models.map((m) => this.toDomain(m));
  }

  async findByBookingId(bookingId: string): Promise<CalendarSlot[]> {
    const models = await CalendarSlotModel.findAll({
      where: { bookingId },
      order: [["date", "ASC"]],
    });
    return models.map((m) => this.toDomain(m));
  }

  async findByListingAndDate(
    listingId: string,
    date: Date
  ): Promise<CalendarSlot | null> {
    const model = await CalendarSlotModel.findOne({
      where: {
        listingId,
        date,
      },
    });
    return model ? this.toDomain(model) : null;
  }

  async findConflicts(
    listingId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<CalendarSlot[]> {
    // Find any slot that is NOT AVAILABLE in the date range
    const models = await CalendarSlotModel.findAll({
      where: {
        listingId,
        date: {
          [Op.gte]: checkIn,
          [Op.lt]: checkOut,
        },
        status: {
          [Op.ne]: SlotStatus.AVAILABLE,
        },
      },
      order: [["date", "ASC"]],
    });
    return models.map((m) => this.toDomain(m));
  }

  async saveAll(slots: CalendarSlot[]): Promise<void> {
    // Use bulkCreate with updateOnDuplicate for atomic upsert
    const data = slots.map((slot) => {
      const json = slot.toJSON();
      return {
        id: json.id,
        listingId: json.listingId,
        date: json.date,
        status: json.status,
        bookingId: json.bookingId,
        blockedBy: json.blockedBy,
        createdAt: json.createdAt,
        updatedAt: json.updatedAt,
      };
    });

    await CalendarSlotModel.bulkCreate(data, {
      updateOnDuplicate: ["status", "bookingId", "blockedBy", "updatedAt"],
    });
  }

  async deleteByListing(listingId: string): Promise<void> {
    await CalendarSlotModel.destroy({
      where: { listingId },
    });
  }

  // ── Mapper ──────────────────────────────────────────

  private toDomain(model: CalendarSlotModel): CalendarSlot {
    return CalendarSlot.rehydrate({
      id: model.id,
      listingId: model.listingId,
      date: new Date(model.date),
      status: model.status as SlotStatus,
      bookingId: model.bookingId,
      blockedBy: model.blockedBy,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }
}
