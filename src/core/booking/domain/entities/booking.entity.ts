import { BookingStatus } from "../value-objects/booking-status"; // Corrected import to use domain BookingStatus
import { DateRange } from "../value-objects/date-range.vo";
import { BookingTransitionService } from "../service/booking-transition.service";
import { BookingLifecycleStatus } from "../value-objects/booking-lifecycle.status";


export interface BookingProps {
  id: string;
  listingId: string;
  customerId: string;
  dateRange: DateRange;
  tenantId: string;
  price: number;
  status: BookingStatus;
  createdAt: Date;
  confirmedAt?: Date;
  updatedAt?: Date;
  cancelReason?: string;
  completedAt?: Date;
  lifecycleStatus: BookingLifecycleStatus;
}

export class Booking {
  private constructor(
    private props: BookingProps) { }

  static create(
    props: Omit<BookingProps, "status" | "createdAt">
  ): Booking {
    return new Booking({
      ...props,
      status: BookingStatus.PENDING,

      createdAt: new Date(),
      lifecycleStatus: BookingLifecycleStatus.UPCOMING,
    });
  }

  static rehydrate(props: BookingProps): Booking {
    return new Booking(props);
  }

  update(fields: { checkInDate?: Date; checkOutDate?: Date; price?: number }): void {
    if (this.props.status === BookingStatus.CANCELLED || this.props.status === BookingStatus.COMPLETED) {
      throw new Error("Cannot modify a cancelled or completed booking");
    }

    if (fields.checkInDate && fields.checkOutDate) {
      if (fields.checkInDate >= fields.checkOutDate) {
        throw new Error("checkInDate must be before checkOutDate");
      }
      this.props.dateRange = new DateRange(fields.checkInDate, fields.checkOutDate);
    } else if (fields.checkInDate || fields.checkOutDate) {
      throw new Error("Both checkInDate and checkOutDate must be provided together");
    }

    if (fields.price !== undefined) {
      this.props.price = fields.price;
    }

    this.props.updatedAt = new Date();
  }

  cancel(reason: string): void {

    BookingTransitionService.ensureTransition(
      this.props.status,
      BookingStatus.CANCELLED
    );

    if (
      this.props.dateRange.checkInDate
      < new Date()
    ) {
      throw new Error(
        "Cannot cancel after check-in"
      );
    }

    this.props.status =
      BookingStatus.CANCELLED;

    this.props.updatedAt = new Date();

    this.props.cancelReason = reason;
  }

  complete(): void {
    BookingTransitionService.ensureTransition(this.props.status, BookingStatus.COMPLETED);

    // 🔥 Safety Rule
    if (
      this.props.status !== BookingStatus.CHECKED_IN
    ) {
      throw new Error("Only checked-in bookings can be completed");
    }

    this.props.status = BookingStatus.COMPLETED;

    this.props.completedAt = new Date();

    this.props.updatedAt = new Date();
  }

  checkIn(): void {
    BookingTransitionService.ensureTransition(this.props.status, BookingStatus.CHECKED_IN);

    if (
      this.props.status !== BookingStatus.CONFIRMED
    ) {
      throw new Error("Only confirmed bookings can be checked in");
    }

    this.props.status = BookingStatus.CHECKED_IN;

    this.props.updatedAt = new Date();
  }


  confirm(): void {

    BookingTransitionService.ensureTransition(this.props.status, BookingStatus.CONFIRMED)

    this.props.status =
      BookingStatus.CONFIRMED; // Use CONFIRMED from domain enum

    this.props.confirmedAt = new Date();

    this.props.updatedAt = new Date();

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

  get customerId() {
    return this.props.customerId;
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get listingId() {
    console.log('listingId =', this.props.listingId);
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

  get confirmedAt() {
    return this.props.confirmedAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get completedAt() {
    return this.props.completedAt;
  }

}