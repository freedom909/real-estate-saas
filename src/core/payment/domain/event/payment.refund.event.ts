//

//
import { DomainEvent } from "@/shared/eventbus/domain.event";

export class PaymentRefundedEvent extends DomainEvent {

  public readonly type = "PAYMENT_REFUNDED";
  public readonly eventName = "PAYMENT_REFUNDED";

  constructor(
    public readonly paymentId: string,
    public readonly bookingId: string,
    public readonly guestId: string,
    public readonly tenantId: string,  
    public readonly amount: number,
    public readonly checkInDate: Date,
    public readonly checkOutDate: Date,
    public readonly refundedAt: Date,
 
  ) {
    super();
  }
}