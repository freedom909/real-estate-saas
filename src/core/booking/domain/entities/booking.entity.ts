import { DateRange } from "../value-objects/date-range.vo";

export type BookingStatus = | "PENDING"| "UPCOMING" | "CONFIRMED" | "CANCELLED";

export interface BookingProps {
  id: string;
  listingId: string;
  guestId: string;
  dateRange: DateRange;
  tenantId: string;
  totalCost: number;
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

  confirm() {
    if (this.props.status !== "PENDING" && this.props.status !== "UPCOMING") {
      throw new Error("Only PENDING or UPCOMING bookings can be confirmed");
    }

    this.props.status = "CONFIRMED";
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

  get totalCost() {
    return this.props.totalCost;
  }

  get dateRange() {
    return this.props.dateRange;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}