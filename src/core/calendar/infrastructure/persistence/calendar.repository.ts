// src/core/calendar/infrastructure/persistence/calendar.repository.ts

import { injectable } from "tsyringe";
import { Op } from "sequelize";
import { ICalendarRepository } from "../../domain/repositories/i-calendar.repository";
import { CalendarSlot } from "../../domain/entities/calendar-slot";
import { CalendarSlotModel } from "../models/calendar-slot.model";
import { SlotStatus } from "../../domain/value-objects/slot-status";

@injectable()
export class CalendarRepository implements ICalendarRepository {
  getSlotsByListing(listingId: string): Promise<CalendarSlot[]> {
    throw new Error("Method not implemented.");
  }

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
  const transaction = await CalendarSlotModel.sequelize!.transaction();

  try {
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

    // Rows that already exist (release/unblock paths) must be UPDATED, not
    // re-inserted — plain bulkCreate would hit the PK / (listingId, date)
    // unique constraint and the release would fail. New rows are inserted in
    // one batch; the unique index uq_calendar_listing_date still guards
    // against concurrent double-booking at the DB level.
    const existing = await CalendarSlotModel.findAll({
      where: { id: data.map((d) => d.id) },
      attributes: ["id"],
      transaction,
    });
    const existingIds = new Set(existing.map((m) => m.id));

    const toInsert = data.filter((d) => !existingIds.has(d.id));
    const toUpdate = data.filter((d) => existingIds.has(d.id));

    if (toInsert.length > 0) {
      await CalendarSlotModel.bulkCreate(toInsert, { transaction });
    }

    for (const row of toUpdate) {
      await CalendarSlotModel.update(
        {
          status: row.status,
          // NOTE: Sequelize skips `undefined` fields in UPDATE — use null so a
          // released slot actually clears its bookingId/blockedBy.
          bookingId: row.bookingId ?? null,
          blockedBy: row.blockedBy ?? null,
          updatedAt: row.updatedAt,
        },
        { where: { id: row.id }, transaction }
      );
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

  async tryReserve(slotId: string, bookingId: string): Promise<boolean> {
    const [affectedCount] = await CalendarSlotModel.update(
      {
        status: SlotStatus.RESERVED,
        bookingId,
        updatedAt: new Date(),
      },
      {
        where: {
          id: slotId,
          status: SlotStatus.AVAILABLE, // compare-and-set: only claim AVAILABLE rows
        },
      }
    );
    return affectedCount > 0;
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
      // DB columns are nullable — normalize null → undefined to match the
      // entity's optional-field semantics (release() clears to undefined).
      bookingId: model.bookingId ?? undefined,
      blockedBy: model.blockedBy ?? undefined,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }
}
