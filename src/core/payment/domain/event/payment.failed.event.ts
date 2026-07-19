import { DomainEvent } from "@/shared/eventbus/domain.event";

export class PaymentFailedEvent extends DomainEvent {

  public readonly type = "PAYMENT_FAILED";
  public readonly eventName = "PAYMENT_FAILED";

  constructor(
    public readonly paymentId: string,
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly tenantId: string,
    public readonly amount: number,
  ) {
    super();
  }
}
