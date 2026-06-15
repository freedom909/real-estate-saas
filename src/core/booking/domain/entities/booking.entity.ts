import { BookingStatus } from "../value-objects/booking-status"; // Corrected import to use domain BookingStatus
import { DateRange } from "../value-objects/date-range.vo";
import { BookingTransitionService } from "../service/booking-transition.service";


export interface BookingProps {
  id: string;
  listingId: string;
  guestId: string;
  dateRange: DateRange;
  tenantId: string;
  price: number;
  status: BookingStatus;
  createdAt: Date;  
}

export class Booking {
  private constructor(
    private props: BookingProps)
     {}

  static create(
    props: Omit<BookingProps, "status" | "createdAt">
  ): Booking {
    return new Booking({
      ...props,
     status: BookingStatus.PENDING, // Use PENDING from domain enum
      
      createdAt: new Date(),
    });
  }

  static rehydrate(props: BookingProps): Booking {
    return new Booking(props);
  }

  cancel() {
    if (this.props.status !== "PENDING") {
      throw new Error("Only UPCOMING bookings can be cancelled");
    }

    if (this.props.dateRange.checkInDate < new Date()) {
      throw new Error("Cannot cancel after check-in");
    }

    this.props.status = BookingStatus.CANCELLED; // Use CANCELLED from domain enum
  }

confirm(): void {

BookingTransitionService.ensureTransition(
this.props.status,
BookingStatus.CONFIRMED // Use CONFIRMED from domain enum
);

this.props.status =
BookingStatus.CONFIRMED; // Use CONFIRMED from domain enum
}

  toJSON() {
    return {
      ...this.props,
      dateRange: this.props.dateRange 
        ? (typeof this.props.dateRange.toJSON === 'function' ? this.props.dateRange.toJSON() : this.props.dateRange)
        : undefined,
    };
  }

  get id() {
    return this.props.id;
  }

  get guestId() {
    return this.props.guestId;
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get listingId() {
    return this.props.listingId;
  }

  get status() {
    return this.props.status;
  }

  get price() {
    return this.props.price;
  }

  get dateRange() {
    return this.props.dateRange;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}