import { DateRange } from "../value-objects/date-range.vo";

export type BookingStatus = | "PENDING"| "UPCOMING" | "CONFIRMED" | "CANCELLED";

export interface BookingProps {
  id: string;
  listingId: string;
  guestId: string;
  dateRange: DateRange;
  totalCost: number;
  status: BookingStatus;
  createdAt: Date;  
}

export class Booking implements BookingProps {
  private constructor(
    private props: BookingProps)
     {}
  listingId: string;
  dateRange: DateRange;
  totalCost: number;
  status: BookingStatus;
  createdAt: Date;

  static create(
    props: Omit<BookingProps, "status" | "createdAt">
  ): Booking {
    return new Booking({
      ...props,
      status: "UPCOMING",
      createdAt: new Date(),
    });
  }

  static rehydrate(props: BookingProps): Booking {
    return new Booking(props);
  }

  cancel() {
    if (this.props.status !== "UPCOMING") {
      throw new Error("Only UPCOMING bookings can be cancelled");
    }

    if (this.props.dateRange.checkInDate < new Date()) {
      throw new Error("Cannot cancel after check-in");
    }

    this.props.status = "CANCELLED";
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
}