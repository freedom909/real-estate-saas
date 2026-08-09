import { Booking } from "../../domain/entities/booking.entity";
import { BookingState } from "../../domain/state/booking-state";
import { BookingLifecycleStatus } from "../../domain/value-objects/booking-lifecycle.status";
import { DateRange } from "../../domain/value-objects/date-range.vo";
import { BookingModel } from "../models/booking.model";

export class BookingMapper {

  static toDomain(model: BookingModel): Booking {
    return Booking.restore({
      id: model.id,

      customerId: model.customerId,

      listingId: model.listingId,

      dateRange: new DateRange(
        model.checkInDate,
        model.checkOutDate
      ),

      price: model.price,

      status: model.status,

      tenantId: model.tenantId,
      createdAt: undefined,
      lifecycleStatus: BookingLifecycleStatus.UPCOMING
    }) 
  };


  // Domain → DB 
  static toPersistence(booking: Booking) {
    return {
      id: booking.id,

      customerId: booking.customerId,

      listingId: booking.listingId,

      checkInDate:
        booking.dateRange.checkInDate,

      checkOutDate:
        booking.dateRange.checkOutDate,

      price:
        booking.price.amount,// Property 'amount' does not exist on type 'number'.

      status:
        booking.status,

      tenantId:
        booking.tenantId

    };
  }
}
