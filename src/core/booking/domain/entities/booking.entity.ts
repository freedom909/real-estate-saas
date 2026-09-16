import { BookingStatus } from "../value-objects/booking-status";
import { DateRange } from "../value-objects/date-range.vo";
import { BookingLifecycleStatus } from "../value-objects/booking-lifecycle.status";
import { BookingTransitionService } from "../service/booking-transition.service";

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
  private constructor(
    private props: BookingProps
  ) {}

  // ============================================================
  // Create / Rehydrate
  // ============================================================

  static create(
    props: Omit<
      BookingProps,
      "status" | "createdAt"
    >
  ): Booking {
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

  // ============================================================
  // State transitions
  // ============================================================

  confirm(): void {
    BookingTransitionService.ensureTransition(
      this.props.status,
      BookingStatus.CONFIRMED
    );

    this.props.status =
      BookingStatus.CONFIRMED;

    this.props.confirmedAt = new Date();
    this.props.updatedAt = new Date();
  }

  checkIn(): void {
    BookingTransitionService.ensureTransition(
      this.props.status,
      BookingStatus.CHECKED_IN
    );

    this.props.status =
      BookingStatus.CHECKED_IN;

    this.props.updatedAt = new Date();
  }

  complete(): void {
    BookingTransitionService.ensureTransition(
      this.props.status,
      BookingStatus.COMPLETED
    );

    this.props.status =
      BookingStatus.COMPLETED;

    this.props.completedAt = new Date();
    this.props.updatedAt = new Date();
  }

  cancel(reason: string): void {
    BookingTransitionService.ensureTransition(
      this.props.status,
      BookingStatus.CANCELLED
    );

    this.props.status =
      BookingStatus.CANCELLED;

    this.props.cancelReason = reason;
    this.props.updatedAt = new Date();
  }

  // ============================================================
  // Booking modification
  // ============================================================

  updateDates(
    dateRange: DateRange
  ): void {
    this.props.dateRange = dateRange;
    this.props.updatedAt = new Date();
  }

  updatePrice(
    price: number
  ): void {
    if (!Number.isFinite(price)) {
      throw new Error(
        "Booking price must be a valid number"
      );
    }

    if (price < 0) {
      throw new Error(
        "Booking price cannot be negative"
      );
    }

    this.props.price = price;
    this.props.updatedAt = new Date();
  }

  // ============================================================
  // Getters
  // ============================================================

  get id(): string {
    return this.props.id;
  }

  get reservationNumber(): string {
    return this.props.reservationNumber;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get tenantId(): string | undefined {
    return this.props.tenantId;
  }

  get listingId(): string {
    return this.props.listingId;
  }

  get status(): BookingStatus {
    return this.props.status;
  }

  get lifecycleStatus(): BookingLifecycleStatus {
    return this.props.lifecycleStatus;
  }

  get price(): number {
    return this.props.price;
  }

  get dateRange(): DateRange {
    return this.props.dateRange;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get confirmedAt(): Date | undefined {
    return this.props.confirmedAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  // ============================================================
  // Serialization
  // ============================================================

  toJSON() {
    return {
      ...this.props,

      dateRange:
        this.props.dateRange?.toJSON?.() ??
        this.props.dateRange,
    };
  }
}