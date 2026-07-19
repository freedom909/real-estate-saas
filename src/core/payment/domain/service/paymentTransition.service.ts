import { PaymentStatus } from "../value-object/payment.status";

export class PaymentTransitionService {

  private static transitions = {

    [PaymentStatus.PENDING]: [
      PaymentStatus.PROCESSING,
      PaymentStatus.CANCELLED,
    ],

    [PaymentStatus.PROCESSING]: [
      PaymentStatus.SUCCEEDED,
      PaymentStatus.FAILED,
    ],

    [PaymentStatus.SUCCEEDED]: [
      PaymentStatus.REFUNDED,
    ],

    [PaymentStatus.FAILED]: [],

    [PaymentStatus.REFUNDED]: [],

    [PaymentStatus.CANCELLED]: [],
  };

  static ensureTransition(
    current: PaymentStatus,
    next: PaymentStatus
  ) {

    const allowed = this.transitions[current];

    if (!allowed.includes(next)) {
      throw new Error(
        `Invalid payment transition: ${current} -> ${next}`
      );
    }
  }
}