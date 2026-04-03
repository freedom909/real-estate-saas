import { IBookingRepository } from "../../domain/repositories/i-booking.repository";
import { Booking } from "../../domain/entities/booking.entity";
import { BookingModel } from "../models/booking.model";
import { DateRange } from "../../domain/value-objects/date-range.vo";

export class MongooseBookingRepository implements IBookingRepository {
  async findById(id: string): Promise<Booking | null> {
    const doc = await BookingModel.findOne({ id });
    if (!doc) return null;

    return Booking.rehydrate({
      id: doc.id,
      listingId: doc.listingId,
      guestId: doc.guestId,
      dateRange: new DateRange(doc.checkInDate, doc.checkOutDate),
      totalCost: doc.totalCost,
      status: doc.status,
      createdAt: doc.createdAt,
    });
  }

  async save(booking: Booking): Promise<void> {
    const data = booking.toJSON();

    await BookingModel.updateOne(
      { id: data.id },
      data,
      { upsert: true }
    );
  }
}