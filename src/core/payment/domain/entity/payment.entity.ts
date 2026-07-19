import { PaymentTransitionService }
  from "../service/paymentTransition.service";

import { PaymentStatus }
  from "../value-object/payment.status";

export interface PaymentProps {

  id: string;

  bookingId: string;

  customerId: string;

  tenantId: string;

  dateRange: {
    checkInDate: Date;
    checkOutDate: Date;
  };

  amount: number;

  status: PaymentStatus;

  createdAt: Date;

  updatedAt?: Date;

  processedAt?: Date;

  completedAt?: Date;

  refundedAt?: Date;

  cancelReason?: string;
  paymentIntentId?: string;
}

export class Payment {

  private constructor(
    private props: PaymentProps
  ) {}

  static create(
    props: Omit<
      PaymentProps,
      | "status"
      | "createdAt"
      | "updatedAt"
      | "processedAt"
      | "completedAt"
      | "refundedAt"
      | "cancelReason"
    >
  ): Payment {

    return new Payment({
      ...props,

      status: PaymentStatus.PENDING,

      createdAt: new Date(),
    });
  }

  static rehydrate(
    props: PaymentProps
  ): Payment {

    return new Payment(props);
  }

  // =====================
  // PENDING -> PROCESSING
  // =====================

  process(): void {

    PaymentTransitionService.ensureTransition(
      this.props.status,
      PaymentStatus.PROCESSING
    );

    this.props.status =
      PaymentStatus.PROCESSING;

    this.props.processedAt =
      new Date();

    this.props.updatedAt =
      new Date();
  }

  // =====================
  // PROCESSING -> SUCCEEDED
  // =====================

  succeed(): void {

    PaymentTransitionService.ensureTransition(
      this.props.status,
      PaymentStatus.SUCCEEDED
    );

    this.props.status =
      PaymentStatus.SUCCEEDED;

    this.props.completedAt =
      new Date();

    this.props.updatedAt =
      new Date();
  }

  // =====================
  // PROCESSING -> FAILED
  // =====================

  fail(): void {

    PaymentTransitionService.ensureTransition(
      this.props.status,
      PaymentStatus.FAILED
    );

    this.props.status =
      PaymentStatus.FAILED;

    this.props.updatedAt =
      new Date();
  }

  // =====================
  // SUCCEEDED -> REFUNDED
  // =====================

  refund(): void {

    PaymentTransitionService.ensureTransition(
      this.props.status,
      PaymentStatus.REFUNDED
    );

    this.props.status =
      PaymentStatus.REFUNDED;

    this.props.refundedAt =
      new Date();

    this.props.updatedAt =
      new Date();


  }

  // =====================
  // PENDING -> CANCELLED
  // =====================

  cancel(
    reason: string
  ): void {

    PaymentTransitionService.ensureTransition(
      this.props.status,
      PaymentStatus.CANCELLED
    );

    this.props.status =
      PaymentStatus.CANCELLED;

    this.props.cancelReason =
      reason;

    this.props.updatedAt =
      new Date();
  }

  // =====================
  // JSON
  // =====================

  toJSON() {

    return {
      ...this.props,
    };
  }

  // =====================
  // GETTERS
  // =====================

get checkInDate() {
  return this.props.dateRange.checkInDate;//
}

get checkOutDate() {
  return this.props.dateRange.checkOutDate;
}

  get id() {
    return this.props.id;
  }

  get bookingId() {
    return this.props.bookingId;
  }

  get customerId() {
    return this.props.customerId;
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get amount() {
    return this.props.amount;
  }

  get status() {
    return this.props.status;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get processedAt() {
    return this.props.processedAt;
  }

  get completedAt() {
    return this.props.completedAt;
  }

  get refundedAt() {
    return this.props.refundedAt;
  }

  get cancelReason() {
    return this.props.cancelReason;
  }

  get paymentIntentId() {
    return this.props.paymentIntentId;
  }
}