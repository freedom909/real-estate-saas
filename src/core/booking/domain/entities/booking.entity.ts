import { BookingStatus } from "../value-objects/booking-status"; // Corrected import to use domain BookingStatus
import { DateRange } from "../value-objects/date-range.vo";
import { BookingLifecycleStatus } from "../value-objects/booking-lifecycle.status";

export interface BookingProps {
  id: string;
  reservationNumber: string;

  listingId: string;
  customerId: string;
  tenantId?: string;

  dateRange: DateRange;

  price: number;

  status: BookingStatus;
  lifecycleStatus: BookingLifecycleStatus;

  createdAt: Date;
  confirmedAt?: Date;
  updatedAt?: Date;
  cancelReason?: string;
  completedAt?: Date;
}

export class Booking {
  cancel(reason: string) {
    if (this.props.status === BookingStatus.CANCELLED) {
      throw new Error("Booking is already cancelled");
    }
    if (this.props.status === BookingStatus.COMPLETED) {
      throw new Error("Cannot cancel a completed booking");
    }
    this.props.status = BookingStatus.CANCELLED;
    this.props.cancelReason = reason;
    this.props.updatedAt = new Date();
  }

  confirm() {
    if (this.props.status !== BookingStatus.PENDING) {
      throw new Error(`Cannot confirm a booking in ${this.props.status} status`);
    }
    this.props.status = BookingStatus.CONFIRMED;
    this.props.confirmedAt = new Date();
    this.props.updatedAt = new Date();
  }
  private constructor(
    private props: BookingProps
  ) {}

  static create( props: Omit< BookingProps, "status" | "createdAt">): Booking {

    return new Booking({
      ...props,

      status: BookingStatus.PENDING,

      createdAt: new Date(),
    });
  }

  static rehydrate(
    props: BookingProps
  ): Booking {

    return new Booking(props);
  }

  get id() {
    return this.props.id;
  }

  get reservationNumber() {
    return this.props.reservationNumber;
  }

  get customerId() {
    return this.props.customerId;
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

  get lifecycleStatus() {
    return this.props.lifecycleStatus;
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

  get confirmedAt() {
    return this.props.confirmedAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get completedAt() {
    return this.props.completedAt;
  }

  toJSON() {
    return {
      ...this.props,

      dateRange:
        this.props.dateRange?.toJSON?.()
        ?? this.props.dateRange,
    };
  }
}