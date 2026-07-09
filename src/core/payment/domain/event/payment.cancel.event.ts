//
import { DomainEvent } from "@/shared/eventbus/domain.event";

export class PaymentCancelledEvent extends DomainEvent {

  public readonly type = "PAYMENT_CANCELLED";
  public readonly eventName = "PAYMENT_CANCELLED";

  constructor(
    public readonly paymentId: string,
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly tenantId: string,  
    public readonly amount: number,
    public readonly checkInDate: Date,
    public readonly checkOutDate: Date,
    public readonly reason: string,
 
  ) {
    super();
  }
}