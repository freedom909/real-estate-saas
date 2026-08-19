// FILE: src/subgraphs/booking/infrastructure/mappers/booking.mapper.ts

import { Booking} from "../../domain/entities/booking.entity";
import { BookingLifecycleStatus } from "../../domain/value-objects/booking-lifecycle.status";
import { DateRange } from "../../domain/value-objects/date-range.vo";
import { BookingModel } from "../models/booking.model";

export class BookingMapper {

  static toDomain(model: BookingModel): Booking {
    return Booking.create({
      id: model.id,
      reservationNumber: model.reservationNumber,      
      customerId: model.customerId,
      tenantId: model.tenantId,
      listingId: model.listingId,

      dateRange: new DateRange(
        model.checkInDate,
        model.checkOutDate
      ),

      price: model.price,
      lifecycleStatus: BookingLifecycleStatus.UPCOMING
    }) 
  };


  // Domain → DB 
  static toPersistence(booking: Booking) {
    return {
      id: booking.id,

      reservationNumber: booking.reservationNumber,
      customerId: booking.customerId,

      listingId: booking.listingId,

      checkInDate:
        booking.dateRange.checkInDate,
      tenantId: booking.tenantId,
      checkOutDate:
        booking.dateRange.checkOutDate,

      price:
        booking.price,

      status:
        booking.status,

    };
  }
}
