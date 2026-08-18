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
  static restore(arg0: { id: string; reservationNumber: string; customerId: string; listingId: string; dateRange: DateRange; price: number; status: BookingStatus; tenantId: string; createdAt: undefined; lifecycleStatus: BookingLifecycleStatus; }): Booking {
    throw new Error("Method not implemented.");
  }
  cancel(reason: string) {
    throw new Error("Method not implemented.");
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