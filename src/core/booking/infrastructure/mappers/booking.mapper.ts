// FILE: src/core/booking/infrastructure/mappers/booking.mapper.ts

import { Booking } from "../../domain/entities/booking.entity";
import { BookingStatus } from "../../domain/value-objects/booking-status";
import { BookingLifecycleStatus } from "../../domain/value-objects/booking-lifecycle.status";
import { DateRange } from "../../domain/value-objects/date-range.vo";
import { BookingModel } from "../models/booking.model";

export class BookingMapper {
  // Database → Domain
  static toDomain(model: BookingModel): Booking {
    return Booking.rehydrate({
      id: model.id,
      reservationNumber: model.reservationNumber,
      customerId: model.customerId,
      tenantId: model.tenantId,
      listingId: model.listingId,

      dateRange: new DateRange(
        new Date(model.checkInDate),
        new Date(model.checkOutDate),
      ),

      price: model.price,
      status: model.status as BookingStatus,

      lifecycleStatus:
        model.bookingLifecycleStatus as BookingLifecycleStatus,

      createdAt: new Date(model.createdAt),
      updatedAt: model.updatedAt
        ? new Date(model.updatedAt)
        : undefined,
      confirmedAt: model.confirmedAt
        ? new Date(model.confirmedAt)
        : undefined,
      completedAt: model.completedAt
        ? new Date(model.completedAt)
        : undefined,

      cancelReason: model.cancelReason,
    });
  }

  // Domain → Database
  static toPersistence(booking: Booking) {
    const data = booking.toJSON();

    return {
      id: data.id,
      reservationNumber: data.reservationNumber,
      customerId: data.customerId,
      tenantId: data.tenantId,
      listingId: data.listingId,

      checkInDate: data.dateRange.checkInDate,
      checkOutDate: data.dateRange.checkOutDate,

      price: data.price,
      status: data.status,
      bookingLifecycleStatus: data.lifecycleStatus,

      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      confirmedAt: data.confirmedAt,
      completedAt: data.completedAt,
      cancelReason: data.cancelReason,
    };
  }
}
